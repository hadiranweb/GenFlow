/**
 * نمونه‌سازی: چند پروندهٔ کامل می‌سازد، ارزیابی + عارضه‌یابی را محاسبه می‌کند و
 * سند HTML نمونه تولید می‌کند — بدون تلگرام و بدون کلید API.
 *   npm run smoke
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../src/config.js';
import { loadContent } from '../src/domain/content.js';
import { scoreGate } from '../src/domain/scoring.js';
import { buildMatrix, collectExplanations, toMatrixBundle } from '../src/domain/matrix.js';
import { MockLlmProvider } from '../src/llm/mock.js';
import { renderReportHtml } from '../src/report/html.js';
import { computeContentHash } from '../src/report/pipeline.js';
import type { AnswersMap, QuestionnaireDef } from '../src/domain/types.js';

/** پاسخ‌های رنجی حول یک پروفایل، با کمی تنوع */
function synth(questionnaire: QuestionnaireDef, profile: number[], startIndex = 0): AnswersMap {
  const answers: AnswersMap = {};
  let i = startIndex;
  for (const section of questionnaire.sections) {
    for (const q of section.questions) {
      const base = profile[i % profile.length]!;
      const jitter = ((i * 37) % 5) - 2;
      answers[q.code] = {
        questionCode: q.code,
        value: Math.max(0, Math.min(10, base + jitter)),
        answeredAt: new Date().toISOString(),
        elapsedMs: 7000 + (i % 6) * 900,
      };
      i += 1;
    }
  }
  return answers;
}

async function main(): Promise<void> {
  process.env['BOT_TOKEN'] ??= '0:smoke-test';
  process.env['LLM_PROVIDER'] ??= 'mock';
  const config = { ...loadConfig(), dataDir: path.resolve('data'), reportsDir: path.resolve('out') };
  const content = loadContent(config.dataDir);
  const llm = new MockLlmProvider(content.actions);
  mkdirSync(config.reportsDir, { recursive: true });

  const cases = [
    { name: 'healthy-node', screening: [9, 9, 8], diagnostics: [8, 8, 7, 8, 7, 8, 8], deep: true, ai: true, withText: true },
    { name: 'borderline-node', screening: [7, 6, 7], diagnostics: [6, 5, 6, 5, 6, 6, 5], deep: false, ai: false, withText: false },
    { name: 'critical-governance', screening: [5, 5, 6], diagnostics: [7, 6, 7, 7, 6, 7, 3], deep: true, ai: false, withText: true },
  ];

  for (const c of cases) {
    const screeningAnswers = synth(content.gate, c.screening);
    const diagnosticsAnswers = synth(content.matrix, c.diagnostics);
    if (c.withText) {
      const first = content.matrix.sections[0]!.questions[0]!;
      diagnosticsAnswers[first.code] = {
        ...diagnosticsAnswers[first.code]!,
        explanation: 'این مورد را قبلاً شروع کرده‌ایم اما هنوز مکتوب نشده است؛ تصمیم اصلی روی دوش خودم است.',
      };
      const gov = content.matrix.sections.find((s) => s.code === 'governance')!.questions[0]!;
      diagnosticsAnswers[gov.code] = {
        ...diagnosticsAnswers[gov.code]!,
        value: 3,
        explanation: 'اگر نباشم کارها می‌خوابد؛ سیستم هنوز به خودم وابسته است و می‌خواهم این را درست کنم.',
      };
    }

    const gate = scoreGate({ questionnaire: content.gate, answers: screeningAnswers, config: content.gateScoring });
    const matrix = buildMatrix({
      questionnaire: content.matrix,
      answers: diagnosticsAnswers,
      config: content.matrixScoring,
      generatedAt: new Date().toISOString(),
    });

    const bundle = toMatrixBundle(matrix, { symptomThreshold: content.matrixScoring.symptomThreshold });
    const explanations = collectExplanations(matrix, diagnosticsAnswers, content.matrix, 40);
    const base = {
      matrix,
      bundle,
      interpretationMatrix: content.interpretationMatrix,
      matrixVersion: content.matrix.version,
      targetIndex: content.matrixScoring.targetIndex,
      symptomThreshold: content.matrixScoring.symptomThreshold,
      now: new Date().toISOString(),
    };

    const rangeInterp = await llm.interpret({ ...base, explanations: [], tier: 'range_only', awaitingHumanReview: false });
    const deep = c.deep
      ? await llm.interpret({
          ...base,
          explanations: c.ai ? explanations : [],
          tier: c.ai ? 'deep_ai' : 'range_only',
          awaitingHumanReview: true,
        })
      : null;
    const chosen = deep ?? rangeInterp;

    const contentHash = computeContentHash({
      matrixAnswers: diagnosticsAnswers,
      matrixVersion: content.matrix.version,
      matrixFormulaVersion: matrix.formulaVersion,
    });

    const html = renderReportHtml({
      reportId: `smoke-${c.name}`,
      sessionId: `smoke-session-${c.name}`,
      sessionNo: 1,
      serial: 100 + cases.indexOf(c),
      generatedAt: new Date(),
      matrix,
      matrixQuestionnaire: content.matrix,
      matrixScoring: content.matrixScoring,
      interpretationMatrix: content.interpretationMatrix,
      matrixAnswers: diagnosticsAnswers,
      explanations,
      interpretation: chosen,
      contentHash,
    });
    const outPath = path.join(config.reportsDir, `sample-${c.name}.html`);
    writeFileSync(outPath, html, 'utf8');

    process.stdout.write(
      [
        `✅ ${c.name}`,
        `   لیبل ارزیابی (فقط داخلی): ${gate.zone} — ${gate.score0to100} · سقف: ${gate.criticalCeiling?.ceiling ?? '-'} · اطمینان ${gate.confidence}`,
        `   عارضه‌یابی: ${matrix.overall0to100} (${matrix.band}) · شکاف ${matrix.gapToTarget} · گلوگاه ${matrix.bottleneck.title}`,
        `   عارضه‌ها: ${matrix.symptoms.length} (کلیدی ${matrix.symptoms.filter((s) => s.critical).length}) · توضیحات: ${matrix.explanationsCount}`,
        `   تفسیر: ${chosen.meta.tier} (${chosen.meta.provider}) · بازبینی انسانی: ${chosen.meta.awaitingHumanReview ? 'بله' : 'خیر'}`,
        `   سند: ${outPath}`,
      ].join('\n') + '\n',
    );
  }
  process.stdout.write('\nℹ️ لیبل ارزیابی فقط در پرونده می‌ماند و در سند کاربر نمایش داده نمی‌شود.\n');
}

void main();
