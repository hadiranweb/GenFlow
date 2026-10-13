/**
 * موتور «درگاه آستانهٔ الگوی ذهنی» — SJT + معیار حذفی صریح (Knock-out)
 *
 * مطابق دیاگرام `docs/diagrams/mindset-threshold-gate.json`:
 *   سه محور: منبع کنترل · فاعلیت و خودتنظیمی · تفکر مسئله‌محور
 *   مکانیزم: قرار دادن متقاضی در سناریوی اصطکاک فرضی و دسته‌بندی پاسخ به یکی از
 *            سه سیگنال: 🔴 مقصر دانستن سیستم/طلبکاری · 🟡 انفعال و انتظار · 🟢 فاعلیت و راهکار
 *   حکم:    هر قرمز → Knock-out (رد) · نبود قرمز + وجود زرد → Hold (ورود مشروط) · همه سبز → Pass
 *
 * مثل موتور مقیاس، اینجا هم هیچ LLM دخالت ندارد؛ ورودی خالص → خروجی خالص.
 */
import type {
  AnswersMap,
  AnswerValue,
  AxisSignalSummary,
  BehaviorStats,
  Confidence,
  GateScoreResult,
  KnockoutRecord,
  MindsetGateConfig,
  QuestionDef,
  QuestionnaireDef,
  Signal,
  UnknownGuardConfig,
  Zone,
  ZoneConfig,
} from './types.js';

export interface ScoreMindsetInput {
  questionnaire: QuestionnaireDef;
  answers: AnswersMap;
  config: MindsetGateConfig;
  zones: ZoneConfig[];
  unknownGuards: UnknownGuardConfig;
  formulaVersion: string;
  /** شمارنده‌های رفتار (ممکن است ناقص باشند؛ مقادیر گمشده صفر فرض می‌شوند) */
  behaviors?: Partial<BehaviorStats>;
  actionToComplainTarget?: number;
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1]! + s[mid]!) / 2 : s[mid]!;
}

/** یافتن گزینهٔ انتخاب‌شده برای یک سؤال SJT */
export function resolveOption(question: QuestionDef, value: AnswerValue): { key: string; text: string; signal: Signal; rationale?: string } | null {
  if (value === null || value === undefined || !question.options) return null;
  const key = String(value);
  const option = question.options.find((o) => o.key === key);
  if (!option) return null;
  const out: { key: string; text: string; signal: Signal; rationale?: string } = {
    key: option.key,
    text: option.text,
    signal: option.signal,
  };
  if (option.rationale) out.rationale = option.rationale;
  return out;
}

const SIGNAL_SCORE: Record<Signal, number> = { green: 1, yellow: 0.5, red: 0 };

export function scoreMindsetGate(input: ScoreMindsetInput): GateScoreResult {
  const { questionnaire, answers, config, zones, unknownGuards } = input;

  const allQuestions = questionnaire.sections.flatMap((s) => s.questions);
  const total = allQuestions.length;

  // ---------------------------------------------------------------- محورها ---
  const axisList: AxisSignalSummary[] = questionnaire.sections.map((section) => {
    const questions = section.questions;
    let red = 0;
    let yellow = 0;
    let green = 0;
    let answered = 0;
    for (const q of questions) {
      const opt = resolveOption(q, answers[q.code]?.value ?? null);
      if (!opt) continue;
      answered += 1;
      if (opt.signal === 'red') red += 1;
      else if (opt.signal === 'yellow') yellow += 1;
      else green += 1;
    }
    const score01 = answered === 0 ? 0 : (green * 1 + yellow * 0.5) / answered;
    const weight = config.axisWeights?.[section.code] ?? section.weight;
    return {
      code: section.code,
      title: section.title,
      weight,
      answered,
      total: questions.length,
      red,
      yellow,
      green,
      score0to100: round2(score01 * 100),
      greenRatio: answered === 0 ? 0 : round2(green / answered),
    };
  });

  const answeredCount = axisList.reduce((a, x) => a + x.answered, 0);
  const completeness = total === 0 ? 0 : answeredCount / total;
  const signalCounts = {
    red: axisList.reduce((a, x) => a + x.red, 0),
    yellow: axisList.reduce((a, x) => a + x.yellow, 0),
    green: axisList.reduce((a, x) => a + x.green, 0),
  };

  // نمرهٔ تشخیصی: میانگین وزنی محورها روی مقیاس سیگنال (سبز=۱۰۰، زرد=۵۰، قرمز=۰)
  const answeredAxes = axisList.filter((a) => a.answered > 0);
  const weightSum = answeredAxes.reduce((a, x) => a + x.weight, 0);
  const score0to100 =
    weightSum === 0
      ? 0
      : round2(answeredAxes.reduce((a, x) => a + x.weight * (x.score0to100 / 100), 0) / weightSum * 100);

  // ------------------------------------------------------------ knock-outs ---
  const knockouts: KnockoutRecord[] = [];
  for (const section of questionnaire.sections) {
    for (const q of section.questions) {
      const opt = resolveOption(q, answers[q.code]?.value ?? null);
      if (!opt || opt.signal !== 'red') continue;
      knockouts.push({
        questionCode: q.code,
        scenario: q.text,
        axisCode: section.code,
        axisTitle: section.title,
        optionKey: opt.key,
        optionText: opt.text,
        ...(opt.rationale ? { rationale: opt.rationale } : {}),
        ...(q.indicator ? { indicator: q.indicator } : {}),
      });
    }
  }

  // -------------------------------------------------------------- گاردها ----
  const answeredQuestions = allQuestions.filter((q) => resolveOption(q, answers[q.code]?.value ?? null) !== null);
  const elapsed = answeredQuestions.map((q) => answers[q.code]!.elapsedMs).filter((x) => x > 0);
  const medianSeconds = elapsed.length >= 5 ? median(elapsed) / 1000 : Number.POSITIVE_INFINITY;
  const rushed = elapsed.length >= 5 && medianSeconds < config.guards.minMedianSecondsPerScenario;

  // الگوی تکراری: آیا کاربر همیشه گزینهٔ با «جایگاه» یکسان را انتخاب می‌کند؟
  const positionCounts = new Map<number, number>();
  for (const q of answeredQuestions) {
    const key = String(answers[q.code]!.value);
    const pos = q.options?.findIndex((o) => o.key === key) ?? -1;
    if (pos >= 0) positionCounts.set(pos, (positionCounts.get(pos) ?? 0) + 1);
  }
  const maxPosition = Math.max(0, ...positionCounts.values());
  const samePositionShare = answeredCount === 0 ? 0 : maxPosition / answeredCount;
  const repeatedPattern = answeredCount >= 5 && samePositionShare > config.guards.maxSamePositionShare;

  const tooFewAnswered = answeredCount < config.guards.minAnswered;

  const unansweredCritical = allQuestions.filter((q) => q.critical).filter((q) => resolveOption(q, answers[q.code]?.value ?? null) === null);

  const hardUnknown =
    completeness < unknownGuards.minCompleteness ||
    (config.requireAllAxesAnswered && axisList.some((a) => a.answered === 0)) ||
    tooFewAnswered ||
    (unknownGuards.requireCriticalAnswered && unansweredCritical.length > 0);

  // ---------------------------------------------------------------- حکم ------
  const allGreen = signalCounts.red === 0 && signalCounts.yellow === 0 && signalCounts.green === answeredCount && answeredCount > 0;
  const greenRatio = answeredCount === 0 ? 0 : signalCounts.green / answeredCount;

  const knockOutTriggered = config.knockoutOnRed
    ? signalCounts.red >= Math.max(1, config.redCountForKnockout)
    : signalCounts.red > 0 && signalCounts.red >= Math.max(1, config.redCountForKnockout);

  let zone: Zone;
  let verdict: GateScoreResult['verdict'];
  if (hardUnknown) {
    zone = 'unknown';
    verdict = 'unknown';
  } else if (knockOutTriggered) {
    zone = 'red';
    verdict = 'knock_out';
  } else if (allGreen && greenRatio >= config.minGreenRatioForPass) {
    zone = 'green';
    verdict = 'pass';
  } else if (signalCounts.yellow > 0) {
    zone = 'yellow';
    verdict = 'hold';
  } else {
    // ترکیبی از سبز و قرمز (بدون زرد) در حالی که knock-out با آستانه فعال نشده است
    zone = 'yellow';
    verdict = 'hold';
  }

  const softSignals = (rushed ? 1 : 0) + (repeatedPattern ? 1 : 0);
  let confidence: Confidence;
  if (zone === 'unknown') confidence = 'low';
  else if (zone === 'green' && softSignals === 0 && completeness === 1) confidence = 'high';
  else if (softSignals === 0 && completeness === 1) confidence = 'medium';
  else if (softSignals <= 1 && completeness >= 0.9) confidence = 'medium';
  else confidence = 'low';

  const guards = [
    {
      code: 'completeness',
      title: 'کامل بودن پاسخ سناریوها',
      triggered: completeness < unknownGuards.minCompleteness,
      detail: `${Math.round(completeness * 100)}٪ (حداقل ${Math.round(unknownGuards.minCompleteness * 100)}٪)`,
    },
    {
      code: 'axis_unanswered',
      title: 'محور بی‌پاسخ',
      triggered: axisList.some((a) => a.answered === 0),
      detail: axisList.filter((a) => a.answered === 0).map((a) => a.title).join('، ') || undefined,
    },
    {
      code: 'critical_unanswered',
      title: 'سناریوهای کلیدی بی‌پاسخ',
      triggered: unansweredCritical.length > 0,
      detail: unansweredCritical.map((q) => q.code).join(', ') || undefined,
    },
    {
      code: 'rushed_scenarios',
      title: 'سناریوها بدون تأمل پاسخ داده شده‌اند',
      triggered: rushed,
      detail: Number.isFinite(medianSeconds) ? `${round2(medianSeconds)} ثانیه/سناریو` : 'دادهٔ کافی نیست',
    },
    {
      code: 'repeated_pattern',
      title: 'الگوی پاسخ تکرارشونده (همیشه یک جایگاه)',
      triggered: repeatedPattern,
      detail: `${Math.round(samePositionShare * 100)}٪ پاسخ‌ها در یک جایگاه`,
    },
  ];

  // --------------------------------------------------- سنجه‌های رفتاری -------
  const behaviors: BehaviorStats = {
    invalidAttempts: input.behaviors?.invalidAttempts ?? 0,
    backMoves: input.behaviors?.backMoves ?? 0,
    resumes: input.behaviors?.resumes ?? 0,
    helpViews: input.behaviors?.helpViews ?? 0,
    totalAnswerSeconds: input.behaviors?.totalAnswerSeconds ?? 0,
    answeredScenarios: input.behaviors?.answeredScenarios ?? answeredCount,
  };
  // «تلاش مجدد مستقل»: تلاش‌های نامعتبر کاربر (پیش از رسیدن به پاسخ درست) به‌ازای هر سناریو
  const selfSufficiency = answeredCount === 0 ? 0 : round2(behaviors.invalidAttempts / answeredCount);

  const needsConversation = zone === 'unknown' || softSignals > 0 || zone === 'red';

  return {
    mode: 'sjt_knockout',
    score0to100,
    zone,
    verdict,
    confidence,
    needsConversation,
    completeness: round2(completeness),
    dimensionScores: axisList.map((a) => ({
      code: a.code,
      title: a.title,
      score: a.score0to100,
      weight: a.weight,
      answered: a.answered,
      total: a.total,
    })),
    guards,
    formulaVersion: input.formulaVersion,
    weightsSnapshot: Object.fromEntries(axisList.map((a) => [a.code, a.weight])),
    thresholdsSnapshot: zones.map((z) => ({ key: z.key, min: z.min })),
    answeredCount,
    totalScoredQuestions: total,
    signalCounts,
    axisSignals: axisList,
    knockouts,
    behavior: {
      ...behaviors,
      answeredScenarios: answeredCount,
      totalAnswerSeconds: behaviors.totalAnswerSeconds || Math.round(elapsed.reduce((a, x) => a + x, 0) / 1000),
      selfSufficiency,
      actionToComplainRatio: null, // نیازمند سیگنال کانال پشتیبانی (خارج از فرم)
      actionToComplainTarget: input.actionToComplainTarget ?? 2,
    },
  };
}

/** برچسب فارسی حکم مطابق دیاگرام */
export function verdictLabel(verdict: GateScoreResult['verdict']): string {
  switch (verdict) {
    case 'pass':
      return '🟢 پذیرش (Pass)';
    case 'hold':
      return '🟡 ورود مشروط (Hold)';
    case 'knock_out':
      return '🔴 رد صریح (Knock-out)';
    case 'label':
      return '🏷️ برچسب داخلی';
    case 'unknown':
    default:
      return '⚪ نامشخص — نیازمند گفت‌وگو';
  }
}
