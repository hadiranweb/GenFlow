/**
 * تست‌های «درگاه آستانهٔ الگوی ذهنی» — SJT + معیار حذفی
 * مطابق دیاگرام docs/diagrams/mindset-threshold-gate.json
 */
import { describe, expect, it } from 'vitest';
import { scoreGate } from '../src/domain/scoring.js';
import { verdictLabel } from '../src/domain/mindset.js';
import type { AnswersMap, BehaviorStats } from '../src/domain/types.js';
import { sjtAnswers, testContent, testMindsetQuestionnaire } from './helpers.js';

const content = testContent();
const gate = testMindsetQuestionnaire();
const questions = gate.sections.flatMap((s) => s.questions);

/**
 * موتور SJT بایگانی شده است (دیگر گیت فعال نیست). این تست‌ها فقط صحت خودِ موتور را
 * تضمین می‌کنند؛ برای اجرای منطق knock-out، سیاست همان موتور را صریحاً روشن می‌کنیم.
 */
const mindsetConfig = {
  ...content.gateScoring,
  mode: 'sjt_knockout' as const,
  // سیاست موتور بایگانی‌شده: بی‌پاسخی سناریوی کلیدی → «نامشخص»
  unknown: { ...content.gateScoring.unknown, requireCriticalAnswered: true },
  mindset: {
    ...content.gateScoring.mindset,
    knockoutOnRed: true,
    redCountForKnockout: 1,
    requireAllAxesAnswered: true,
  },
};

function score(answers: AnswersMap, overrides: Partial<typeof mindsetConfig> = {}) {
  return scoreGate({
    questionnaire: gate,
    answers,
    config: { ...mindsetConfig, ...overrides },
  });
}

describe('پیکربندی درگاه', () => {
  it('موتور بایگانی‌شده ۱۵ سناریو در ۳ محور دارد', () => {
    expect(gate.mode).toBe('sjt_knockout');
    expect(questions).toHaveLength(15);
    expect(gate.sections.map((s) => s.code)).toEqual(['locus_of_control', 'agency_resilience', 'problem_solving']);
    expect(questions.every((q) => q.kind === 'sjt' && (q.options?.length ?? 0) >= 3)).toBe(true);
  });

  it('در هر سناریو دقیقاً سه سیگنال (سبز/زرد/قرمز) وجود دارد', () => {
    for (const q of questions) {
      const signals = (q.options ?? []).map((o) => o.signal).sort();
      expect(signals).toEqual(['green', 'red', 'yellow']);
    }
  });

  it('جایگاه گزینهٔ سبز بین سناریوها ثابت نیست (پرهیز از سوگیری جایگاه)', () => {
    const greenPositions = questions.map((q) => (q.options ?? []).findIndex((o) => o.signal === 'green'));
    expect(new Set(greenPositions).size).toBeGreaterThan(1);
  });
});

describe('حکم درگاه', () => {
  it('همه سبز → پذیرش (Pass) با اطمینان بالا', () => {
    const r = score(sjtAnswers(gate, 'green'));
    expect(r.verdict).toBe('pass');
    expect(r.zone).toBe('green');
    expect(r.confidence).toBe('high');
    expect(r.signalCounts).toEqual({ red: 0, yellow: 0, green: 15 });
    expect(r.knockouts).toHaveLength(0);
    expect(r.needsConversation).toBe(false);
  });

  it('حتی یک پاسخ قرمز → Knock-out، هرچند میانگین بقیه عالی باشد (جبران‌ناپذیری معیار حذفی)', () => {
    const answers: AnswersMap = { ...sjtAnswers(gate, 'green') };
    const target = questions[7]!;
    const redOption = target.options!.find((o) => o.signal === 'red')!;
    answers[target.code] = {
      questionCode: target.code,
      value: redOption.key,
      signal: 'red',
      answeredAt: new Date().toISOString(),
      elapsedMs: 9000,
    };
    const r = score(answers);
    expect(r.verdict).toBe('knock_out');
    expect(r.zone).toBe('red');
    expect(r.signalCounts).toEqual({ red: 1, yellow: 0, green: 14 });
    // نمرهٔ تشخیصی بالاست (۸۰٪+) اما حکم، رد است — همان معنای knock-out
    expect(r.score0to100).toBeGreaterThan(90);
    expect(r.knockouts).toHaveLength(1);
    expect(r.knockouts![0]!.questionCode).toBe(target.code);
    expect(r.knockouts![0]!.axisTitle).toBe(gate.sections.find((s) => s.code === target.dimension)!.title);
    expect(r.knockouts![0]!.optionText).toBe(redOption.text);
  });

  it('مسیر تصمیم: با یک قرمز، سایر پاسخ‌ها هم بی‌اثر نمی‌شوند (گزارش همهٔ knock-outها)', () => {
    const r = score(sjtAnswers(gate, 'red'));
    expect(r.knockouts).toHaveLength(15);
    expect(r.verdict).toBe('knock_out');
    expect(r.signalCounts!.red).toBe(15);
  });

  it('زرد بدون قرمز → ورود مشروط (Hold)', () => {
    const r = score(sjtAnswers(gate, (ai, qi) => (ai === 1 && qi % 2 === 0 ? 'yellow' : 'green')));
    expect(r.verdict).toBe('hold');
    expect(r.zone).toBe('yellow');
    expect(r.signalCounts!.red).toBe(0);
    expect(r.signalCounts!.yellow).toBeGreaterThan(0);
  });

  it('تنظیم red_count_for_knockout=2 → یک قرمز فقط Hold می‌دهد', () => {
    const base = sjtAnswers(gate, 'green');
    const t1 = questions[2]!;
    const t2 = questions[9]!;
    const withOneRed: AnswersMap = {
      ...base,
      [t1.code]: {
        questionCode: t1.code,
        value: t1.options!.find((o) => o.signal === 'red')!.key,
        signal: 'red',
        answeredAt: new Date().toISOString(),
        elapsedMs: 9000,
      },
    };
    const config = { ...mindsetConfig, mindset: { ...mindsetConfig.mindset, redCountForKnockout: 2 } };
    const one = scoreGate({ questionnaire: gate, answers: withOneRed, config });
    expect(one.verdict).toBe('hold');

    const withTwoRed: AnswersMap = {
      ...withOneRed,
      [t2.code]: {
        questionCode: t2.code,
        value: t2.options!.find((o) => o.signal === 'red')!.key,
        signal: 'red',
        answeredAt: new Date().toISOString(),
        elapsedMs: 9000,
      },
    };
    const two = scoreGate({ questionnaire: gate, answers: withTwoRed, config });
    expect(two.verdict).toBe('knock_out');
  });

  it('nبود قرمز و سبز کامل کافی نبودن نسبت سبز → Hold', () => {
    const config = {
      ...mindsetConfig,
      mindset: { ...mindsetConfig.mindset, minGreenRatioForPass: 1.0 },
    };
    const answers: AnswersMap = { ...sjtAnswers(gate, 'green') };
    const t = questions[0]!;
    answers[t.code] = {
      questionCode: t.code,
      value: t.options!.find((o) => o.signal === 'yellow')!.key,
      signal: 'yellow',
      answeredAt: new Date().toISOString(),
      elapsedMs: 9000,
    };
    const r = scoreGate({ questionnaire: gate, answers, config });
    expect(r.verdict).toBe('hold');
    expect(r.signalCounts!.green).toBe(14);
  });
});

describe('گاردهای اعتبار در حالت SJT', () => {
  it('پاسخ ناقص → نامشخص (حکم صادر نمی‌شود)', () => {
    const partial = sjtAnswers(gate, 'green');
    // حذف ۸ سناریو (بیش از ۲۰٪)
    for (const q of questions.slice(0, 8)) delete partial[q.code];
    const r = score(partial);
    expect(r.zone).toBe('unknown');
    expect(r.verdict).toBe('unknown');
    expect(r.confidence).toBe('low');
    expect(r.guards.find((g) => g.code === 'completeness')?.triggered).toBe(true);
  });

  it('بی‌پاسخی یک محور کامل → نامشخص', () => {
    const answers = sjtAnswers(gate, 'green');
    for (const q of gate.sections[2]!.questions) delete answers[q.code];
    const r = score(answers);
    expect(r.verdict).toBe('unknown');
    expect(r.guards.find((g) => g.code === 'axis_unanswered')?.triggered).toBe(true);
  });

  it('بی‌پاسخی سناریوی کلیدی → نامشخص', () => {
    const answers = sjtAnswers(gate, 'green');
    delete answers['loc_form_reset'];
    const r = score(answers);
    expect(r.verdict).toBe('unknown');
    expect(r.guards.find((g) => g.code === 'critical_unanswered')?.triggered).toBe(true);
  });

  it('پاسخ «هیچ‌کدام» (null) به‌عنوان بی‌پاسخ شمرده می‌شود', () => {
    const answers: AnswersMap = { ...sjtAnswers(gate, 'green') };
    answers[questions[3]!.code] = {
      questionCode: questions[3]!.code,
      value: null,
      answeredAt: new Date().toISOString(),
      elapsedMs: 9000,
    };
    const r = score(answers);
    expect(r.answeredCount).toBe(14);
    expect(r.completeness).toBeLessThan(1);
  });

  it('پاسخ‌دهی شتاب‌زده گارد را فعال و اطمینان را کم می‌کند', () => {
    const fast = score(sjtAnswers(gate, 'green', 900));
    expect(fast.guards.find((g) => g.code === 'rushed_scenarios')?.triggered).toBe(true);
    expect(fast.confidence).not.toBe('high');
  });

  it('الگوی تکراری (همیشه یک جایگاه) گارد را فعال می‌کند', () => {
    // همیشه گزینهٔ اول هر سناریو انتخاب می‌شود
    const answers: AnswersMap = {};
    for (const q of questions) {
      const opt = q.options![0]!;
      answers[q.code] = {
        questionCode: q.code,
        value: opt.key,
        signal: opt.signal,
        answeredAt: new Date().toISOString(),
        elapsedMs: 9000,
      };
    }
    const r = score(answers);
    expect(r.guards.find((g) => g.code === 'repeated_pattern')?.triggered).toBe(true);
  });

  it('گزینهٔ نامعتبر در پاسخ، در شمارش نمی‌آید (بی‌پاسخ محسوب می‌شود)', () => {
    const answers: AnswersMap = { ...sjtAnswers(gate, 'green') };
    answers[questions[5]!.code] = {
      questionCode: questions[5]!.code,
      value: 'z',
      answeredAt: new Date().toISOString(),
      elapsedMs: 9000,
    };
    const r = score(answers);
    expect(r.answeredCount).toBe(14);
  });
});

describe('محورها، شمارش سیگنال و سنجه‌های رفتاری', () => {
  it('خلاصهٔ محورها شمارش و نمرهٔ تشخیصی هر محور را می‌دهد', () => {
    const answers = sjtAnswers(gate, (ai, qi) => {
      if (ai === 0) return 'green';
      if (ai === 1) return qi < 3 ? 'yellow' : 'green';
      return qi < 1 ? 'red' : 'green';
    });
    const r = score(answers);
    const loc = r.axisSignals!.find((a) => a.code === 'locus_of_control')!;
    const agency = r.axisSignals!.find((a) => a.code === 'agency_resilience')!;
    const ps = r.axisSignals!.find((a) => a.code === 'problem_solving')!;
    expect(loc).toMatchObject({ green: 5, yellow: 0, red: 0, score0to100: 100 });
    expect(agency).toMatchObject({ green: 2, yellow: 3, red: 0 });
    expect(agency.score0to100).toBe(70);
    expect(ps).toMatchObject({ green: 4, yellow: 0, red: 1 });
    expect(ps.score0to100).toBe(80);
    expect(r.verdict).toBe('knock_out');
  });

  it('وزن محورها در نمرهٔ تشخیصی اثر می‌گذارد', () => {
    const answers = sjtAnswers(gate, (ai) => (ai === 0 ? 'yellow' : 'green'));
    const heavyOnFirst = scoreGate({
      questionnaire: gate,
      answers,
      config: {
        ...mindsetConfig,
        mindset: { ...mindsetConfig.mindset, axisWeights: { locus_of_control: 0.98, agency_resilience: 0.01, problem_solving: 0.01 } },
      },
    });
    const heavyOnOthers = scoreGate({
      questionnaire: gate,
      answers,
      config: {
        ...mindsetConfig,
        mindset: { ...mindsetConfig.mindset, axisWeights: { locus_of_control: 0.01, agency_resilience: 0.495, problem_solving: 0.495 } },
      },
    });
    expect(heavyOnFirst.score0to100).toBeLessThan(heavyOnOthers.score0to100);
  });

  it('سنجهٔ «نسبت اقدام به شکایت» تا اتصال کانال پشتیبانی عدد جعلی نمی‌سازد', () => {
    const r = score(sjtAnswers(gate, 'green'));
    expect(r.behavior).toBeDefined();
    expect(r.behavior!.actionToComplainRatio).toBeNull();
    expect(r.behavior!.actionToComplainTarget).toBe(2);
  });

  it('شمارنده‌های رفتار ورودی از لایهٔ گفت‌وگو در نتیجه منعکس می‌شوند', () => {
    const behaviors: BehaviorStats = {
      invalidAttempts: 3,
      backMoves: 2,
      resumes: 1,
      helpViews: 1,
      totalAnswerSeconds: 100,
      answeredScenarios: 15,
    };
    const r = scoreGate({ questionnaire: gate, answers: sjtAnswers(gate, 'green'), config: mindsetConfig, behaviors });
    expect(r.behavior!.invalidAttempts).toBe(3);
    expect(r.behavior!.resumes).toBe(1);
    // نرخ تلاش مجدد مستقل = تلاش نامعتبر / سناریوهای پاسخ‌داده‌شده
    expect(r.behavior!.selfSufficiency).toBeCloseTo(0.2, 2);
  });

  it('برچسب‌های حکم مطابق دیاگرام بایگانی‌شده هستند', () => {
    expect(verdictLabel('pass')).toContain('پذیرش');
    expect(verdictLabel('hold')).toContain('ورود مشروط');
    expect(verdictLabel('knock_out')).toContain('Knock-out');
    expect(verdictLabel('unknown')).toContain('نامشخص');
    expect(verdictLabel('label')).toContain('برچسب');
  });
});
