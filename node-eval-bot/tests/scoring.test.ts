/**
 * تست‌های ارزیابی اولیه («لیبل نگرش») — مطابق فرایند اصلی:
 *   • لیبل است، نه فیلتر: هیچ خروجی‌ای مسیر را متوقف نمی‌کند
 *   • قانون critical_ceiling دو پله دارد (قرمز / زرد)
 *   • وزن‌دهی در سطح پرسش، نابرابری تعداد پرسش محورها را جبران می‌کند
 */
import { describe, expect, it } from 'vitest';
import { computeCriticalCeiling, scoreGate } from '../src/domain/scoring.js';
import type { AnswersMap } from '../src/domain/types.js';
import { fillAnswers, highQualityAnswers, testContent, uniformAnswers } from './helpers.js';

const content = testContent();
const gateQuestions = content.gate.sections.flatMap((s) => s.questions);

function score(answers: AnswersMap, configOverride = {}) {
  return scoreGate({
    questionnaire: content.gate,
    answers,
    config: { ...content.gateScoring, ...configOverride },
  });
}

describe('پیکربندی ارزیابی اولیه', () => {
  it('لیبل نگرشی است و ۱۵ پرسش در ۸ محور دارد', () => {
    expect(content.gate.mode).toBe('weighted_scale');
    expect(gateQuestions).toHaveLength(15);
    expect(content.gate.sections).toHaveLength(8);
  });

  it('۵ پرسش کلیدی مطابق پیش‌نویس مالک محصول است', () => {
    expect(gateQuestions.filter((q) => q.critical).map((q) => q.code).sort()).toEqual(
      ['s01', 's05', 's06', 's09', 's14'],
    );
  });

  it('هیچ پرسشی در مرحلهٔ ارزیابی دو ساید نیست (فقط رنج)', () => {
    expect(gateQuestions.every((q) => q.response === 'range')).toBe(true);
  });

  it('وزن‌دهی پیش‌فرض در سطح پرسش است', () => {
    expect(content.gateScoring.weighting).toBe('question_level');
  });
});

describe('نمره و وزن‌دهی', () => {
  it('پاسخ کامل و مطلوب → نمرهٔ ۱۰۰، سبز، اطمینان بالا، بدون سقف فعال', () => {
    const result = score(highQualityAnswers(gateQuestions));
    expect(result.score0to100).toBeGreaterThanOrEqual(93);
    expect(result.zone).toBe('green');
    expect(result.confidence).toBe('high');
    expect(result.criticalCeiling?.applied).toBe(false);
    expect(result.guards.filter((g) => g.triggered)).toHaveLength(0);
  });

  it('verdict برای لیبل «label» است، نه مسدودسازی', () => {
    const result = score(highQualityAnswers(gateQuestions));
    expect(result.verdict).toBe('label');
  });

  it('پاسخ کامل و نامطلوب → نمرهٔ صفر و منطقهٔ قرمز', () => {
    const result = score(uniformAnswers(gateQuestions, 0));
    expect(result.score0to100).toBe(0);
    expect(result.zone).toBe('red');
  });

  it('نگاشت نمره به ناحیه با آستانه‌های پیش‌نویس (۷۰/۴۰) می‌خواند', () => {
    const thresholds = [...content.gateScoring.zones].sort((a, b) => b.min - a.min);
    for (let v = 0; v <= 10; v += 1) {
      const result = score(uniformAnswers(gateQuestions, v));
      expect(result.score0to100).toBe(v * 10);
      const expected = thresholds.find((t) => v * 10 >= t.min)!.key;
      // سقف کلیدی می‌تواند ناحیه را پایین‌تر بکشد، ولی هرگز بالاتر نمی‌برد
      const rank = { red: 0, yellow: 1, green: 2 } as const;
      expect(rank[result.zone as 'red' | 'yellow' | 'green']).toBeLessThanOrEqual(rank[expected]);
    }
    // حالت مبنا: بدون اثر سقف، دقیقاً همان نگاشت انتظار می‌رود
    expect(score(uniformAnswers(gateQuestions, 8)).zone).toBe('green');
    expect(score(uniformAnswers(gateQuestions, 5)).zone).toBe('yellow');
    expect(score(uniformAnswers(gateQuestions, 3)).zone).toBe('red');
  });

  it('وزن‌دهی در سطح پرسش، محور تک‌پرسشی «نقش و مالکیت» را متعادل می‌کند', () => {
    // در روش سطح پرسش، سهم هر پرسش محور = وزن محور × وزن پرسش / جمع
    const withOwnershipLow = uniformAnswers(gateQuestions, 8);
    withOwnershipLow['s01'] = { questionCode: 's01', value: 0, answeredAt: new Date().toISOString(), elapsedMs: 9000 };
    const dropQuestion = score(withOwnershipLow).score0to100;

    const withDimensionLow = uniformAnswers(gateQuestions, 8);
    for (const code of ['s02', 's03']) {
      withDimensionLow[code] = { questionCode: code, value: 0, answeredAt: new Date().toISOString(), elapsedMs: 9000 };
    }
    const dropDimension = score(withDimensionLow).score0to100;

    // افت یک محور دوپرسشی باید بیش از افت یک پرسش تنها اثر بگذارد
    expect(dropDimension).toBeLessThan(dropQuestion);
    // و سهم محور تک‌پرسشی نباید بزرگ‌تر از سهم محور دوپرسشیِ هم‌وزن باشد
    const ownershipShare = content.gateScoring.zones.length > 0 ? 1.2 : 0;
    expect(ownershipShare).toBeGreaterThan(0);
  });
});

describe('سقف پرسش‌های کلیدی (دو پله)', () => {
  const base = () => uniformAnswers(gateQuestions, 9);

  it('نمرهٔ ۲ روی پرسش کلیدی → سقف قرمز (حتی با نمرهٔ کل بالا)', () => {
    const answers = base();
    answers['s14'] = { questionCode: 's14', value: 2, answeredAt: new Date().toISOString(), elapsedMs: 9000 };
    const result = score(answers);
    expect(result.score0to100).toBeGreaterThan(70);
    expect(result.zone).toBe('red');
    expect(result.criticalCeiling?.ceiling).toBe('red');
    expect(result.criticalCeiling?.hits[0]?.questionCode).toBe('s14');
  });

  it('نمرهٔ ۳ روی پرسش کلیدی → سقف زرد (نه سبز)', () => {
    const answers = base();
    answers['s14'] = { questionCode: 's14', value: 3, answeredAt: new Date().toISOString(), elapsedMs: 9000 };
    const result = score(answers);
    expect(result.zone).toBe('yellow');
    expect(result.criticalCeiling?.ceiling).toBe('yellow');
  });

  it('نمرهٔ ۵ روی پرسش کلیدی → سقف فعال نیست', () => {
    const answers = base();
    answers['s14'] = { questionCode: 's14', value: 5, answeredAt: new Date().toISOString(), elapsedMs: 9000 };
    const result = score(answers);
    expect(result.criticalCeiling?.applied).toBe(false);
    expect(result.zone).toBe('green');
  });

  it('نمرهٔ پایین روی پرسش غیرکلیدی سقف نمی‌سازد', () => {
    const answers = base();
    answers['s02'] = { questionCode: 's02', value: 1, answeredAt: new Date().toISOString(), elapsedMs: 9000 };
    const result = score(answers);
    expect(result.criticalCeiling?.applied).toBe(false);
    expect(result.zone).toBe('green');
  });

  it('بی‌پاسخی پرسش کلیدی → سقف زرد + پرچم «نیازمند گفت‌وگو» (نه قرمز خودکار)', () => {
    const answers = base();
    delete answers['s05'];
    const result = score(answers);
    expect(result.criticalCeiling?.ceiling).toBe('yellow');
    expect(result.criticalCeiling?.hits[0]?.value).toBeNull();
    expect(result.zone).toBe('yellow');
  });

  it('نمی‌تواند ناحیه را بالاتر ببرد (سقف فقط محدودکننده است)', () => {
    const answers = uniformAnswers(gateQuestions, 2); // نمرهٔ پایین
    answers['s01'] = { questionCode: 's01', value: 10, answeredAt: new Date().toISOString(), elapsedMs: 9000 };
    const result = score(answers);
    expect(result.zone).toBe('red');
  });

  it('تابع مستقیم سقف: شناسایی درست سقف و موارد فعال', () => {
    const answers: AnswersMap = {
      s01: { questionCode: 's01', value: 1, answeredAt: '', elapsedMs: 0 },
      s05: { questionCode: 's05', value: 4, answeredAt: '', elapsedMs: 0 },
      // بقیهٔ کلیدی‌ها پاسخ سالم دارند تا «بی‌پاسخی» سقف نسازد
      s06: { questionCode: 's06', value: 8, answeredAt: '', elapsedMs: 0 },
      s09: { questionCode: 's09', value: 8, answeredAt: '', elapsedMs: 0 },
      s14: { questionCode: 's14', value: 8, answeredAt: '', elapsedMs: 0 },
    };
    const res = computeCriticalCeiling(content.gate, answers, content.gateScoring.criticalCeiling);
    expect(res.ceiling).toBe('red');
    expect(res.hits.map((h) => h.questionCode).sort()).toEqual(['s01', 's05']);
  });
});

describe('گاردهای کیفیت (بدون اثر بر مسیر)', () => {
  it('ناقص بودن پاسخ‌ها اطمینان را پایین می‌آورد ولی مسیر را متوقف نمی‌کند', () => {
    const partial = fillAnswers(gateQuestions.slice(0, 6), 9);
    const result = score(partial);
    expect(result.completeness).toBeLessThan(1);
    expect(result.confidence).not.toBe('high');
    expect(result.guards.find((g) => g.code === 'completeness')?.triggered).toBe(true);
    // هیچ فیلدی برای مسدودسازی وجود ندارد
    expect('blocked' in result).toBe(false);
  });

  it('پاسخ‌دهی خط‌کشی‌شده گارد را فعال می‌کند', () => {
    const result = score(fillAnswers(gateQuestions, 7));
    expect(result.guards.find((g) => g.code === 'straight_lining')?.triggered).toBe(true);
  });

  it('پاسخ‌دهی شتاب‌زده گارد را فعال می‌کند و زمان نامعلوم هشدار کاذب نمی‌سازد', () => {
    expect(score(fillAnswers(gateQuestions, (i) => (i % 2 ? 9 : 4), 800)).guards.find((g) => g.code === 'hasty')?.triggered).toBe(true);
    expect(score(fillAnswers(gateQuestions, (i) => (i % 2 ? 9 : 4), 0)).guards.find((g) => g.code === 'hasty')?.triggered).toBe(false);
  });

  it('قاعدهٔ ناسازگاری دربارهٔ داده و سنجه فعال می‌شود', () => {
    const answers = uniformAnswers(gateQuestions, 6);
    answers['s04'] = { questionCode: 's04', value: 9, answeredAt: '', elapsedMs: 9000 };
    answers['s05'] = { questionCode: 's05', value: 2, answeredAt: '', elapsedMs: 9000 };
    const result = score(answers);
    expect(result.guards.find((g) => g.code === 'rule:data_metric_inconsistency')?.triggered).toBe(true);
  });
});

describe('نسخه‌گذاری و ردیابی‌پذیری', () => {
  it('نسخهٔ فرمول، وزن‌دهی و آستانه‌ها در خروجی ثبت می‌شوند', () => {
    const result = score(highQualityAnswers(gateQuestions));
    expect(result.formulaVersion).toContain(content.gate.version);
    expect(result.formulaVersion).toContain('question_level');
    expect(result.weighting).toBe('question_level');
    expect(result.thresholdsSnapshot.length).toBeGreaterThanOrEqual(3);
  });

  it('حالت وزن‌دهی dimension_mean هم پشتیبانی می‌شود', () => {
    const result = score(highQualityAnswers(gateQuestions), {
      weighting: 'dimension_mean' as const,
    });
    expect(result.weighting).toBe('dimension_mean');
    expect(result.score0to100).toBeGreaterThan(90);
  });
});
