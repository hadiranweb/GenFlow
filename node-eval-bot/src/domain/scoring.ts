/**
 * موتور ارزیابی اولیه («لیبل نگرش») — کاملاً قطعی و بدون LLM.
 *
 * ─ دو تغییری که فرایند اصلی (دیاگرام ۱۴۰۵/۰۷/۲۰) ایجاب کرد ─
 *  ۱) خروجی یک **لیبل** است، نه فیلتر: هیچ‌کدام از این خروجی‌ها مسیر کاربر را متوقف
 *     نمی‌کند و به کاربر نمایش داده نمی‌شود (مصرف: پرونده/سطح مدیریت).
 *  ۲) قانون «critical_ceiling» دو پله دارد:
 *       نمرهٔ ≤ critical_red_max     → سقف منطقه = قرمز
 *       نمرهٔ ≤ critical_yellow_max  → سقف منطقه = زرد (سبز نمی‌شود)
 *       پرسش کلیدی بی‌پاسخ (اگر unanswered_is_flagged) → سقف زرد + پرچم «نیازمند گفت‌وگو»
 *
 * ─ فرمول ─
 *   effective_i  = reverse ? (min+max) − raw_i : raw_i
 *   normalized_i = (effective_i − min) / (max − min)
 *   سهم هر پرسش:
 *     weighting = question_level  →  (وزن محور × وزن پرسش)
 *     weighting = dimension_mean  →  وزن محور، و میانگین داخل محور
 *   score0to100 = ۱۰۰ × Σ(weight×normalized)/Σ(weight)
 */
import type {
  AnswersMap,
  Confidence,
  CriticalCeilingConfig,
  CriticalCeilingHit,
  CriticalCeilingResult,
  GateScoreResult,
  GateScoringConfig,
  QuestionnaireDef,
  Weighting,
  Zone,
} from './types.js';
import { scoreMindsetGate } from './mindset.js';

export interface BehaviorCounters {
  invalidAttempts: number;
  backMoves: number;
  resumes: number;
  helpViews: number;
}

export interface ScoreGateInput {
  questionnaire: QuestionnaireDef;
  answers: AnswersMap;
  config: GateScoringConfig;
  behaviors?: BehaviorCounters;
}

/** نقطهٔ ورود واحد؛ موتور بر اساس `questionnaire.mode` انتخاب می‌شود. */
export function scoreGate(input: ScoreGateInput): GateScoreResult {
  const { questionnaire, answers, config } = input;
  if (questionnaire.mode === 'sjt_knockout') {
    return scoreMindsetGate({
      questionnaire,
      answers,
      config: config.mindset,
      zones: config.zones,
      unknownGuards: config.unknown,
      formulaVersion: `${questionnaire.version}+${config.version}`,
      ...(input.behaviors ? { behaviors: input.behaviors } : {}),
      actionToComplainTarget: config.behaviors.actionToComplainTarget,
    });
  }
  return scoreWeightedScale(input);
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / xs.length);
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1]! + s[mid]!) / 2 : s[mid]!;
}

/** تبدیل پاسخ خام به مقدار مؤثر (اعمال polarity) و نرمال‌سازی به ۰..۱ */
export function normalizeAnswer(raw: number, polarity: 'direct' | 'reverse', min: number, max: number): number {
  const effective = polarity === 'reverse' ? min + max - raw : raw;
  const clamped = Math.min(Math.max(effective, min), max);
  return (clamped - min) / (max - min);
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

/**
 * محاسبهٔ سقف منطقه بر پایهٔ پرسش‌های کلیدی.
 * خروجی: بالاترین سقفی که فعال شده (red > yellow > none) + فهرست موارد فعال‌شده.
 */
export function computeCriticalCeiling(
  questionnaire: QuestionnaireDef,
  answers: AnswersMap,
  config: CriticalCeilingConfig,
): CriticalCeilingResult {
  const hits: CriticalCeilingHit[] = [];
  const dimensionTitle = (code: string): string =>
    questionnaire.sections.find((s) => s.code === code)?.title ?? code;

  for (const section of questionnaire.sections) {
    for (const q of section.questions) {
      if (!q.critical) continue;
      const rec = answers[q.code];
      const value = rec && typeof rec.value === 'number' ? rec.value : null;

      if (value === null) {
        if (!config.unansweredIsFlagged) continue;
        hits.push({
          questionCode: q.code,
          text: q.text,
          dimension: section.code,
          dimensionTitle: section.title,
          value: null,
          ceiling: 'yellow',
        });
        continue;
      }
      if (value <= config.criticalRedMax) {
        hits.push({
          questionCode: q.code,
          text: q.text,
          dimension: section.code,
          dimensionTitle: dimensionTitle(section.code),
          value,
          ceiling: 'red',
        });
      } else if (value <= config.criticalYellowMax) {
        hits.push({
          questionCode: q.code,
          text: q.text,
          dimension: section.code,
          dimensionTitle: dimensionTitle(section.code),
          value,
          ceiling: 'yellow',
        });
      }
    }
  }

  const ceiling: CriticalCeilingResult['ceiling'] = hits.some((h) => h.ceiling === 'red')
    ? 'red'
    : hits.length > 0
      ? 'yellow'
      : 'none';

  return { applied: hits.length > 0, ceiling, hits };
}

export function scoreWeightedScale({ questionnaire, answers, config, behaviors }: ScoreGateInput): GateScoreResult {
  const { scaleMin: min, scaleMax: max } = questionnaire;
  const thresholds = config.weightedScale?.zones ?? config.zones;
  const unknownCfg = config.weightedScale?.unknown ?? config.unknown;
  const weighting: Weighting = config.weighting ?? 'question_level';

  // ------------------------------------------------ نمرهٔ محورها و کل
  const answeredValuesRaw: number[] = [];
  const elapsedList: number[] = [];

  const dimensionScores = questionnaire.sections.map((section) => {
    const scored = section.questions.filter((q) => q.kind === 'scored' || q.kind === 'sjt');
    const values: number[] = [];
    let weightedSum = 0;
    let weightTotal = 0;
    for (const q of scored) {
      const rec = answers[q.code];
      if (!rec || rec.value === null || rec.value === undefined) continue;
      if (typeof rec.value !== 'number') continue;
      const n = normalizeAnswer(rec.value, q.polarity, min, max);
      values.push(n);
      weightedSum += section.weight * q.weight * n;
      weightTotal += section.weight * q.weight;
      answeredValuesRaw.push(rec.value);
      elapsedList.push(rec.elapsedMs);
    }
    return {
      code: section.code,
      title: section.title,
      weight: section.weight,
      answered: values.length,
      total: scored.length,
      score: values.length === 0 ? 0 : mean(values),
      dispersion: stddev(values),
      weightedSum,
      weightTotal,
    };
  });

  let score01 = 0;
  if (weighting === 'question_level') {
    const num = dimensionScores.reduce((a, d) => a + d.weightedSum, 0);
    const den = dimensionScores.reduce((a, d) => a + d.weightTotal, 0);
    score01 = den === 0 ? 0 : num / den;
  } else {
    const answeredDims = dimensionScores.filter((d) => d.answered > 0);
    const wsum = answeredDims.reduce((a, d) => a + d.weight, 0);
    score01 = wsum === 0 ? 0 : answeredDims.reduce((a, d) => a + d.weight * d.score, 0) / wsum;
  }
  const score0to100 = round2(score01 * 100);

  // ------------------------------------------------ کامل بودن
  const scoredQuestions = questionnaire.sections.flatMap((s) => s.questions).filter((q) => q.kind !== 'context');
  const answeredCount = scoredQuestions.filter((q) => {
    const rec = answers[q.code];
    return rec !== undefined && rec.value !== null && rec.value !== undefined;
  }).length;
  const completeness = scoredQuestions.length === 0 ? 0 : answeredCount / scoredQuestions.length;

  // ------------------------------------------------ گاردهای کیفیت
  let longestRun = 0;
  let currentRun = 0;
  let previous: number | null = null;
  for (const v of answeredValuesRaw) {
    if (v === previous) currentRun += 1;
    else {
      currentRun = 1;
      previous = v;
    }
    if (currentRun > longestRun) longestRun = currentRun;
  }
  const straightLineTriggered =
    answeredValuesRaw.length >= unknownCfg.maxStraightLineRun && longestRun >= unknownCfg.maxStraightLineRun;

  const maxDispersion = Math.max(0, ...dimensionScores.filter((d) => d.answered >= 3).map((d) => d.dispersion));
  const dispersionTriggered = maxDispersion > unknownCfg.maxWithinDimensionDispersion;

  const validElapsed = elapsedList.filter((x) => x > 0);
  const medianSeconds = validElapsed.length >= 5 ? median(validElapsed) / 1000 : Number.POSITIVE_INFINITY;
  const speedTriggered = validElapsed.length >= 5 && medianSeconds < unknownCfg.minMedianSecondsPerAnswer;

  const ruleHits = questionnaire.consistencyRules
    .map((rule) => {
      const allTrue = rule.when.every((cond) => {
        const rec = answers[cond.question];
        if (!rec || rec.value === null || typeof rec.value !== 'number') return false;
        switch (cond.op) {
          case '>=':
            return rec.value >= cond.value;
          case '<=':
            return rec.value <= cond.value;
          case '>':
            return rec.value > cond.value;
          case '<':
            return rec.value < cond.value;
          case '==':
            return rec.value === cond.value;
          default:
            return false;
        }
      });
      return allTrue ? rule : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  // ------------------------------------------------ منطقه: نمره + سقف کلیدی
  const sorted = [...thresholds].sort((a, b) => b.min - a.min);
  const matched = sorted.find((t) => score0to100 >= t.min);
  let zone: Zone = matched ? matched.key : 'red';

  const ceilingCfg: CriticalCeilingConfig =
    config.criticalCeiling ?? { criticalRedMax: 2, criticalYellowMax: 4, unansweredIsFlagged: true };
  const ceiling = computeCriticalCeiling(questionnaire, answers, ceilingCfg);

  if (ceiling.ceiling === 'red') zone = 'red';
  else if (ceiling.ceiling === 'yellow' && zone === 'green') zone = 'yellow';

  // اطمینان (فقط برای پرونده؛ هیچ اثری بر مسیر ندارد)
  const softSignals =
    (straightLineTriggered ? 1 : 0) +
    (dispersionTriggered ? 1 : 0) +
    (speedTriggered ? 1 : 0) +
    ruleHits.length +
    (ceiling.hits.some((h) => h.value === null) ? 1 : 0);

  let confidence: Confidence;
  if (completeness < unknownCfg.minCompleteness) confidence = 'low';
  else if (softSignals === 0 && completeness >= 1) confidence = 'high';
  else if (softSignals <= 1 && completeness >= 0.9) confidence = 'medium';
  else confidence = 'low';

  const unansweredCritical = scoredQuestions
    .filter((q) => q.critical)
    .filter((q) => {
      const rec = answers[q.code];
      return rec === undefined || rec.value === null;
    })
    .map((q) => q.code);

  const guards = [
    {
      code: 'completeness',
      title: 'کامل بودن پاسخ‌ها',
      triggered: completeness < unknownCfg.minCompleteness,
      detail: `${Math.round(completeness * 100)}٪ (حداقل ${Math.round(unknownCfg.minCompleteness * 100)}٪)`,
    },
    {
      code: 'critical_unanswered',
      title: 'پرسش‌های کلیدی بی‌پاسخ',
      triggered: unansweredCritical.length > 0,
      detail: unansweredCritical.length > 0 ? unansweredCritical.join(', ') : undefined,
    },
    {
      code: 'critical_ceiling',
      title: 'سقف پرسش‌های کلیدی',
      triggered: ceiling.applied,
      detail:
        ceiling.applied
          ? `${ceiling.ceiling === 'red' ? 'قرمز' : 'زرد'} — ${ceiling.hits.map((h) => h.questionCode).join(', ')}`
          : undefined,
    },
    {
      code: 'straight_lining',
      title: 'پاسخ‌دهی یکنواخت/خط‌کشی‌شده',
      triggered: straightLineTriggered,
      detail: `بلندترین دنبالهٔ یکسان: ${longestRun}`,
    },
    {
      code: 'dispersion',
      title: 'ناهمگونی درک در یک محور',
      triggered: dispersionTriggered,
      detail: `بیشترین پراکندگی: ${round2(maxDispersion)}`,
    },
    {
      code: 'hasty',
      title: 'پاسخ‌دهی شتاب‌زده',
      triggered: speedTriggered,
      detail: Number.isFinite(medianSeconds) ? `${round2(medianSeconds)} ثانیه/پرسش` : 'دادهٔ کافی نیست',
    },
    ...ruleHits.map((r) => ({ code: `rule:${r.code}`, title: r.title, triggered: true, detail: r.message })),
  ];

  const behaviorStats = behaviors
    ? {
        invalidAttempts: behaviors.invalidAttempts,
        backMoves: behaviors.backMoves,
        resumes: behaviors.resumes,
        helpViews: behaviors.helpViews,
        totalAnswerSeconds: Math.round(elapsedList.reduce((a, x) => a + x, 0) / 1000),
        answeredScenarios: answeredCount,
      }
    : undefined;

  return {
    mode: 'weighted_scale',
    weighting,
    score0to100,
    zone,
    verdict: 'label',
    confidence,
    needsConversation: confidence !== 'high',
    completeness: round2(completeness),
    dimensionScores: dimensionScores.map((d) => ({
      code: d.code,
      title: d.title,
      score: round2(d.score * 100),
      weight: d.weight,
      answered: d.answered,
      total: d.total,
    })),
    guards,
    formulaVersion: `${questionnaire.version}+${config.version}+${weighting}`,
    weightsSnapshot: Object.fromEntries(questionnaire.sections.map((s) => [s.code, s.weight])),
    thresholdsSnapshot: thresholds.map((t) => ({ key: t.key, min: t.min })),
    answeredCount,
    totalScoredQuestions: scoredQuestions.length,
    criticalCeiling: ceiling,
    ...(behaviorStats
      ? {
          behavior: {
            ...behaviorStats,
            selfSufficiency:
              answeredCount === 0 ? 0 : round2(behaviorStats.invalidAttempts / answeredCount),
            actionToComplainRatio: null,
            actionToComplainTarget: config.behaviors.actionToComplainTarget,
          },
        }
      : {}),
  };
}

export function zoneLabel(zone: Zone, config?: GateScoringConfig): string {
  const fromConfig = config?.zones.find((z) => z.key === zone)?.label;
  if (fromConfig) return fromConfig;
  switch (zone) {
    case 'green':
      return '🟢 سبز';
    case 'yellow':
      return '🟡 زرد';
    case 'red':
      return '🔴 قرمز';
    case 'unknown':
      return '⚪ نامشخص';
  }
}

export function zoneColor(zone: Zone, config?: GateScoringConfig): string {
  const fromConfig = config?.zones.find((z) => z.key === zone)?.color;
  if (fromConfig) return fromConfig;
  switch (zone) {
    case 'green':
      return '#16a34a';
    case 'yellow':
      return '#d97706';
    case 'red':
      return '#dc2626';
    case 'unknown':
      return '#6b7280';
  }
}
