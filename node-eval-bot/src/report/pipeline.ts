/**
 * خط تولید سند: ماتریس → تفسیر (داخلی و/یا عمیق) → HTML → فایل
 *
 * دو لایهٔ تفسیر مطابق دیاگرام فرایند:
 *   ۱) «تفسیر داخلی رنجی» — همیشه اجرا می‌شود (قطعی، بدون مدل، فقط رنج)
 *   ۲) «تفسیر عمیق» — فقط اگر کلید مدیر روشن باشد:
 *        • مسیر AI (اگر کلید AI روشن باشد): متن‌ها هم به مدل می‌رود → پیش‌نویس
 *        • مسیر انسانی: پرونده در وضعیت «در انتظار بازبینی انسانی» علامت می‌خورد
 *
 * «اثر انگشت محتوا» روی پاسخ‌های رنجی + نسخهٔ فرمول‌ها محاسبه می‌شود تا سند
 * قابل بازبینی و تشخیص دست‌کاری باشد.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { AppConfig } from '../config.js';
import type { ContentBundle } from '../domain/content.js';
import { collectExplanations, toMatrixBundle } from '../domain/matrix.js';
import type { AnswersMap, Interpretation, MatrixResult } from '../domain/types.js';
import type { LlmProvider } from '../llm/types.js';
import { renderReportHtml } from './html.js';

export function computeContentHash(input: {
  matrixAnswers: AnswersMap;
  matrixVersion: string;
  matrixFormulaVersion: string;
}): string {
  const canonical = JSON.stringify({
    matrix: Object.entries(input.matrixAnswers)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, v.value]),
    versions: { matrix: input.matrixVersion, formula: input.matrixFormulaVersion },
  });
  return createHash('sha256').update(canonical).digest('hex');
}

export interface GenerateReportResult {
  htmlPath: string;
  html: string;
  interpretation: Interpretation;
  rangeInterpretation: Interpretation;
  deepInterpretation: Interpretation | null;
  contentHash: string;
  tier: 'range_only' | 'deep_ai';
  awaitingHumanReview: boolean;
}

export async function generateReport(input: {
  config: AppConfig;
  content: ContentBundle;
  llm: LlmProvider;
  data: {
    reportId: string;
    sessionId: string;
    sessionNo: number;
    serial: number | null;
    generatedAt: Date;
    matrix: MatrixResult;
    matrixAnswers: AnswersMap;
    gateAnswers: AnswersMap;
    gateResult: unknown;
    /** کلیدهای مدیر: تفسیر عمیق و تفسیر AI (از دیتابیس) */
    deepInterpretation: boolean;
    aiInterpretation: boolean;
  };
}): Promise<GenerateReportResult> {
  const { config, content, llm, data } = input;
  const nowIso = data.generatedAt.toISOString();
  const symptomThreshold = content.matrixScoring.symptomThreshold;

  const bundle = toMatrixBundle(data.matrix, { symptomThreshold });
  const allExplanations = collectExplanations(
    data.matrix,
    data.matrixAnswers,
    content.matrix,
    content.matrixScoring.interpretation.maxExplanationsInPayload,
  );

  // ---------------------------------------------- ۱) تفسیر داخلی رنجی (همیشه)
  const rangeInterpretation = await llm.interpret({
    matrix: data.matrix,
    bundle,
    explanations: [], // مطابق دیاگرام: تفسیر داخلی فقط روی رنج‌ها
    matrixVersion: content.matrix.version,
    targetIndex: content.matrixScoring.targetIndex,
    symptomThreshold,
    now: nowIso,
    tier: 'range_only',
    awaitingHumanReview: false,
  });

  // ---------------------------------------------- ۲) تفسیر عمیق (اختیاری)
  const deepEnabled = data.deepInterpretation;
  const aiEnabled = deepEnabled && data.aiInterpretation;
  const explanationsForModel =
    aiEnabled && content.matrixScoring.interpretation.explanationsToAi ? allExplanations : [];

  let deepInterpretation: Interpretation | null = null;
  if (deepEnabled) {
    deepInterpretation = await llm.interpret({
      matrix: data.matrix,
      bundle,
      explanations: explanationsForModel,
      matrixVersion: content.matrix.version,
      targetIndex: content.matrixScoring.targetIndex,
      symptomThreshold,
      now: nowIso,
      tier: aiEnabled ? 'deep_ai' : 'range_only',
      awaitingHumanReview: true,
    });
    // اگر مدل شکست خورد، تفسیر عمیق عملاً همان تفسیر داخلی است
    if (deepInterpretation.meta.status !== 'ok') {
      deepInterpretation = {
        ...deepInterpretation,
        meta: { ...deepInterpretation.meta, tier: 'range_only', awaitingHumanReview: true },
      };
    }
  }

  const chosen = deepInterpretation ?? rangeInterpretation;
  const tier: 'range_only' | 'deep_ai' = chosen.meta.tier;
  const awaitingHumanReview = deepEnabled && (!aiEnabled || chosen.meta.status !== 'ok' || deepEnabled);

  const contentHash = computeContentHash({
    matrixAnswers: data.matrixAnswers,
    matrixVersion: content.matrix.version,
    matrixFormulaVersion: data.matrix.formulaVersion,
  });

  const html = renderReportHtml({
    reportId: data.reportId,
    sessionId: data.sessionId,
    sessionNo: data.sessionNo,
    serial: data.serial,
    generatedAt: data.generatedAt,
    matrix: data.matrix,
    matrixQuestionnaire: content.matrix,
    matrixScoring: content.matrixScoring,
    matrixAnswers: data.matrixAnswers,
    explanations: allExplanations,
    interpretation: chosen,
    contentHash,
  });

  mkdirSync(config.reportsDir, { recursive: true });
  const htmlPath = path.join(config.reportsDir, `report-${data.reportId}.html`);
  writeFileSync(htmlPath, html, 'utf8');

  return {
    htmlPath,
    html,
    interpretation: chosen,
    rangeInterpretation,
    deepInterpretation,
    contentHash,
    tier,
    awaitingHumanReview,
  };
}
