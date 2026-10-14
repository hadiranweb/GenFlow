/**
 * ماتریس عارضه‌یابی — کاملاً قطعی و بدون LLM.
 *
 * مطابق پیش‌نویس مالک محصول:
 *   target_index: 75            → امتیاز مطلوب هر محور (مبنای شکاف)
 *   symptom_threshold: 4        → نمرهٔ ≤ ۴ روی هر گزاره = «عارضهٔ مشاهده‌شده»
 *   severity_bands: 75 / 60 / 40 → مطلوب / مرزی / نیازمند اصلاح / بحرانی
 *
 * نکتهٔ دو ساید بودن: توضیح متنی کاربر **وارد محاسبه نمی‌شود**؛ فقط برای تفسیر
 * (انسانی/AI) نگه داشته می‌شود و در خروجی به‌عنوان «عارضهٔ توضیح‌دار» می‌آید.
 */
import type {
  AnswersMap,
  DomainPriority,
  MatrixBand,
  MatrixDomainResult,
  MatrixResult,
  MatrixScoringConfig,
  QuestionDef,
  QuestionnaireDef,
  SymptomRecord,
} from './types.js';
import { normalizeAnswer } from './scoring.js';

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / xs.length);
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function bandOf(score0to100: number, bands: MatrixScoringConfig['severityBands']): MatrixBand {
  if (score0to100 >= bands.healthy) return 'healthy';
  if (score0to100 >= bands.borderline) return 'borderline';
  if (score0to100 >= bands.needs_fix) return 'needs_fix';
  return 'critical';
}

/** یافتن نوار تفسیری (بازهای سند شامل هر دو سر) برای یک امتیاز */
export function bandForValue(
  value: number,
  bands: Array<{ key: string; label: string; min: number; max: number; maxInclusive: boolean }>,
): { key: string; label: string } {
  // مرزهای پیوسته و نیم‌باز سند: [min, max) — تا نیم‌امتیازهایی مانند ۳۹٫۵
  // بدون طبقه نمانند؛ فقط آخرین نوار سرِ بالا را هم شامل می‌شود.
  const hit =
    bands.find((b) => value >= b.min && (b.maxInclusive ? value <= b.max : value < b.max)) ??
    bands[bands.length - 1]!;
  return { key: hit.key, label: hit.label };
}

export function bandLabel(band: MatrixBand): string {
  switch (band) {
    case 'healthy':
      return 'مطلوب';
    case 'borderline':
      return 'مرزی';
    case 'needs_fix':
      return 'نیازمند اصلاح';
    case 'critical':
      return 'بحرانی';
  }
}

/** آستانهٔ سطح گزاره (۰..۱۰) برای «عارضهٔ مشاهده‌شده» و «هشدار» */
const ITEM_WARNING_MAX = 6;
const ITEM_ACCEPTABLE_MAX = 8;

export interface BuildMatrixInput {
  questionnaire: QuestionnaireDef;
  answers: AnswersMap;
  config: MatrixScoringConfig;
  generatedAt: string;
}

export function buildMatrix({ questionnaire, answers, config, generatedAt }: BuildMatrixInput): MatrixResult {
  const { scaleMin: min, scaleMax: max } = questionnaire;
  const target = config.targetIndex;
  const symptomThreshold = config.symptomThreshold;

  let itemCritical = 0;
  let itemWarning = 0;
  let itemAcceptable = 0;
  let itemHealthy = 0;
  const symptoms: SymptomRecord[] = [];
  let explanationsCount = 0;

  const domains: MatrixDomainResult[] = questionnaire.sections.map((section) => {
    const scored = section.questions.filter((q) => q.kind !== 'context');
    const normalized: number[] = [];
    const criticalGaps: MatrixDomainResult['criticalGaps'] = [];
    const strengths: MatrixDomainResult['strengths'] = [];
    let criticalBelowThreshold = false;

    for (const q of scored) {
      const rec = answers[q.code];
      if (rec?.explanation && rec.explanation.trim() !== '') explanationsCount += 1;
      if (!rec || rec.value === null || rec.value === undefined) continue;
      if (typeof rec.value !== 'number') continue;

      const n = normalizeAnswer(rec.value, q.polarity, min, max);
      normalized.push(n);
      const effective = round2(n * 10); // نمایش روی مقیاس ۰..۱۰

      if (effective <= symptomThreshold) {
        criticalGaps.push({ questionCode: q.code, text: q.text, value: effective });
        symptoms.push({
          questionCode: q.code,
          text: q.text,
          dimension: section.code,
          dimensionTitle: section.title,
          value: effective,
          critical: q.critical,
          ...(rec.explanation ? { explanation: rec.explanation } : {}),
        });
        if (q.critical) criticalBelowThreshold = true;
        itemCritical += 1;
      } else if (effective <= ITEM_WARNING_MAX) {
        itemWarning += 1;
      } else if (effective <= ITEM_ACCEPTABLE_MAX) {
        itemAcceptable += 1;
      } else {
        strengths.push({ questionCode: q.code, text: q.text, value: effective });
        itemHealthy += 1;
      }
    }

    const score0to100 = normalized.length === 0 ? 0 : round2(mean(normalized) * 100);
    // قرارداد سند پنج‌لایه: هر لایه ۰ تا ۲۰ — معادل «مجموع نمره‌های تعدیل‌شده ÷ ۲»
    const score0to20 = round2((score0to100 / 100) * config.fiveLayer.perLayerMax);
    return {
      code: section.code,
      title: section.title,
      weight: section.weight,
      score0to100,
      score0to20,
      layerBand: bandForValue(score0to20, config.fiveLayer.layerBands),
      band: bandOf(score0to100, config.severityBands),
      answered: normalized.length,
      total: scored.length,
      answerRate: scored.length === 0 ? 0 : round2(normalized.length / scored.length),
      dispersion: round2(stddev(normalized)),
      criticalGaps: criticalGaps.sort((a, b) => a.value - b.value),
      strengths: strengths.sort((a, b) => b.value - a.value),
      criticalBelowThreshold,
    };
  });

  // ---------------------------------------------- نمرهٔ کل و شکاف
  const answeredDomains = domains.filter((d) => d.answered > 0);
  const weightSum = answeredDomains.reduce((acc, d) => acc + d.weight, 0);
  const overall0to100 =
    weightSum === 0
      ? 0
      : round2(answeredDomains.reduce((acc, d) => acc + d.weight * (d.score0to100 / 100), 0) / weightSum * 100);

  // ---------------------------------------------- اولویت‌بندی: شکاف × وزن
  const priorities: DomainPriority[] = answeredDomains
    .map((d) => {
      const gap = round2(Math.max(0, target - d.score0to100));
      const criticalWeakCount = d.criticalGaps.filter((g) =>
        questionnaire.sections
          .find((s) => s.code === d.code)!
          .questions.find((q) => q.code === g.questionCode)?.critical,
      ).length;
      return {
        code: d.code,
        title: d.title,
        score0to100: d.score0to100,
        band: d.band,
        weight: d.weight,
        gap,
        priority: round2(gap * d.weight),
        criticalWeakCount,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  // مرتب‌سازی پایدار است؛ در تساوی نمره، ترتیب لایه‌ها (بالادستی‌تر اول) حفظ
  // می‌شود — عین قاعدهٔ سند برای «گلوگاه بحرانی».
  const sortedByScore = [...answeredDomains].sort((a, b) => a.score0to100 - b.score0to100);
  const bottleneck = sortedByScore[0] ?? { code: 'n/a', title: 'داده کافی نیست', score0to100: 0 };
  const strongest = sortedByScore[sortedByScore.length - 1] ?? bottleneck;

  return {
    overall0to100,
    band: bandOf(overall0to100, config.severityBands),
    maturity: bandForValue(overall0to100, config.fiveLayer.maturityBands),
    gapToTarget: round2(Math.max(0, target - overall0to100)),
    targetIndex: target,
    bottleneck: { code: bottleneck.code, title: bottleneck.title, score0to100: bottleneck.score0to100 },
    strongest: { code: strongest.code, title: strongest.title, score0to100: strongest.score0to100 },
    domains: sortedByScore,
    priorities,
    symptoms: symptoms.sort((a, b) => a.value - b.value),
    severityCounts: {
      critical: itemCritical,
      warning: itemWarning,
      acceptable: itemAcceptable,
      healthy: itemHealthy,
    },
    answeredCount: domains.reduce((acc, d) => acc + d.answered, 0),
    totalQuestions: domains.reduce((acc, d) => acc + d.total, 0),
    explanationsCount,
    formulaVersion: config.version,
    generatedAt,
  };
}

/**
 * بستهٔ فشردهٔ ماتریس برای مفسر (داخلی یا AI).
 * فقط سیگنال‌دارها (عارضه/قوت) ارسال می‌شوند تا هزینهٔ توکن و گمراهی کم شود.
 */
export interface MatrixBundle {
  overall: number;
  band: MatrixBand;
  /** رتبهٔ بلوغ کل طبق نوارهای موقت سند */
  maturity: { key: string; label: string };
  gapToTarget: number;
  targetIndex: number;
  symptomThreshold: number;
  bottleneck: MatrixResult['bottleneck'];
  strongest: MatrixResult['strongest'];
  severityCounts: MatrixResult['severityCounts'];
  priorities: Array<{ code: string; title: string; score: number; band: MatrixBand; gap: number; priority: number }>;
  domains: Array<{
    code: string;
    title: string;
    score: number;
    /** امتیاز لایه از ۲۰ (قرارداد سند پنج‌لایه) */
    score20: number;
    /** نوار موقت لایه: ضعف / در حال رشد / قوی */
    layerBand: { key: string; label: string };
    band: MatrixBand;
    weight: number;
    dispersion: number;
    criticalBelowThreshold: boolean;
    criticalGaps: Array<{ code: string; text: string; value: number }>;
    strengths: Array<{ code: string; text: string; value: number }>;
  }>;
}

export function toMatrixBundle(
  matrix: MatrixResult,
  opts: { maxItemsPerDomain?: number; symptomThreshold?: number } = {},
): MatrixBundle {
  const maxItems = opts.maxItemsPerDomain ?? 4;
  return {
    overall: matrix.overall0to100,
    band: matrix.band,
    maturity: matrix.maturity,
    gapToTarget: matrix.gapToTarget,
    targetIndex: matrix.targetIndex,
    symptomThreshold: opts.symptomThreshold ?? 4,
    bottleneck: matrix.bottleneck,
    strongest: matrix.strongest,
    severityCounts: matrix.severityCounts,
    priorities: matrix.priorities.slice(0, 5).map((p) => ({
      code: p.code,
      title: p.title,
      score: p.score0to100,
      band: p.band,
      gap: p.gap,
      priority: p.priority,
    })),
    domains: matrix.domains.map((d) => ({
      code: d.code,
      title: d.title,
      score: d.score0to100,
      score20: d.score0to20,
      layerBand: d.layerBand,
      band: d.band,
      weight: d.weight,
      dispersion: d.dispersion,
      criticalBelowThreshold: d.criticalBelowThreshold,
      criticalGaps: d.criticalGaps.slice(0, maxItems).map((g) => ({ code: g.questionCode, text: g.text, value: g.value })),
      strengths: d.strengths.slice(0, maxItems).map((s) => ({ code: s.questionCode, text: s.text, value: s.value })),
    })),
  };
}

/** فهرست توضیحات کاربر برای ارسال به مفسر (مرتب‌شده بر پایهٔ اولویت محور) */
export function collectExplanations(
  matrix: MatrixResult,
  answers: AnswersMap,
  questionnaire: QuestionnaireDef,
  limit: number,
): Array<{ questionCode: string; dimensionTitle: string; rangeValue: number; text: string }> {
  const order = new Map(matrix.priorities.map((p, i) => [p.code, i]));
  const byCode = new Map<string, QuestionDef>();
  for (const s of questionnaire.sections) for (const q of s.questions) byCode.set(q.code, q);

  const items: Array<{ questionCode: string; dimensionTitle: string; rangeValue: number; text: string; rank: number }> = [];
  for (const [code, rec] of Object.entries(answers)) {
    if (!rec.explanation || rec.explanation.trim() === '') continue;
    const q = byCode.get(code);
    if (!q) continue;
    const dimTitle = questionnaire.sections.find((s) => s.code === q.dimension)?.title ?? q.dimension;
    items.push({
      questionCode: code,
      dimensionTitle: dimTitle,
      rangeValue: typeof rec.value === 'number' ? rec.value : -1,
      text: rec.explanation.trim(),
      rank: order.get(q.dimension) ?? 99,
    });
  }
  return items
    .sort((a, b) => a.rank - b.rank || a.rangeValue - b.rangeValue)
    .slice(0, limit)
    .map(({ rank: _rank, ...rest }) => rest);
}
