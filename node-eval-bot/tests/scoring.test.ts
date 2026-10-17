/**
 * تست‌های بانک فعال ارزیابی: ۱۲ پرسش رنجی MindsetGate-EP (MG-A/B/C).
 * سیاست محصول: خروجی فقط لیبل داخلی است، نه فیلتر؛ سه سناریوی SJT فعال نیستند.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scoreGate } from '../src/domain/scoring.js';
import type { AnswersMap } from '../src/domain/types.js';
import { fillAnswers, highQualityAnswers, testContent, uniformAnswers } from './helpers.js';

const content = testContent();
const gateQuestions = content.gate.sections.flatMap((s) => s.questions);
const ownerCopy = JSON.parse(
  readFileSync(path.resolve('docs/reference/mindsetgate-ep-12-owner-copy.json'), 'utf8'),
) as {
  version: string;
  layers: Array<{ code: string; title: string }>;
  questions: Array<{ code: string; source_ref: string; layer: string; text: string; reverse: boolean }>;
  excluded_sjt_scenarios: string[];
};

function score(answers: AnswersMap) {
  return scoreGate({ questionnaire: content.gate, answers, config: content.gateScoring });
}

describe('پیکربندی بانک فعال MindsetGate-EP', () => {
  it('دقیقاً ۱۲ سؤال رنجی در سه محور MG-A/B/C دارد؛ SJT وارد فرم فعال نیست', () => {
    expect(content.gate.version).toBe(ownerCopy.version);
    expect(content.gate.mode).toBe('weighted_scale');
    expect(gateQuestions).toHaveLength(12);
    expect(content.gate.sections.map((s) => ({ code: s.code, title: s.title }))).toEqual(ownerCopy.layers);
    expect(content.gate.sections.map((s) => s.questions.length)).toEqual([4, 4, 4]);
    expect(gateQuestions.every((q) => q.response === 'range')).toBe(true);
    expect(gateQuestions.every((q) => !q.critical)).toBe(true);
  });

  it('متن و شناسهٔ هر ۱۲ سؤال دقیقاً با شیت MindsetGate-EP مطابقت دارد', () => {
    for (const expected of ownerCopy.questions) {
      const q = gateQuestions.find((item) => item.sourceRef === expected.source_ref);
      expect(q, expected.source_ref).toBeDefined();
      expect(q!.code).toBe(expected.code);
      expect(q!.dimension).toBe(expected.layer);
      expect(q!.text).toBe(expected.text);
      expect(q!.polarity === 'reverse').toBe(expected.reverse);
    }
  });

  it('فقط MG-A3، MG-B3 و MG-C3 معکوس‌اند', () => {
    expect(gateQuestions.filter((q) => q.polarity === 'reverse').map((q) => q.sourceRef)).toEqual([
      'MG-A3',
      'MG-B3',
      'MG-C3',
    ]);
    expect(ownerCopy.excluded_sjt_scenarios).toEqual(['S1', 'S2', 'S3']);
  });

  it('وزن سه محور برابر است و در هر محور چهار سؤال وجود دارد', () => {
    expect(content.gate.sections.map((s) => s.weight)).toEqual([1, 1, 1]);
    expect(content.gateScoring.weighting).toBe('question_level');
  });
});

describe('نمره و قطبیت بانک ۱۲سؤالی', () => {
  it('همهٔ پاسخ‌های مؤثر ۱۰ → نمرهٔ ۱۰۰، لیبل سبز و بدون مسدودسازی', () => {
    const result = score(highQualityAnswers(gateQuestions));
    expect(result.score0to100).toBeGreaterThanOrEqual(93);
    expect(result.zone).toBe('green');
    expect(result.verdict).toBe('label');
    expect(result.criticalCeiling?.applied).toBe(false);
    expect('blocked' in result).toBe(false);
  });

  it('همهٔ پاسخ‌های مؤثر ۰ → قرمز، اما همچنان فقط لیبل داخلی', () => {
    const result = score(uniformAnswers(gateQuestions, 0));
    expect(result.score0to100).toBe(0);
    expect(result.zone).toBe('red');
    expect(result.verdict).toBe('label');
    expect('blocked' in result).toBe(false);
  });

  it('قطبیت معکوس پیش از محاسبه اعمال می‌شود: خام ۱۰ در MG-A3 نمرهٔ مؤثر صفر است', () => {
    const answers = uniformAnswers(gateQuestions, 10);
    const reverse = gateQuestions.find((q) => q.sourceRef === 'MG-A3')!;
    answers[reverse.code] = {
      questionCode: reverse.code,
      value: 10,
      answeredAt: new Date().toISOString(),
      elapsedMs: 9000,
    };
    const result = score(answers);
    // ۱۱ پاسخ مؤثر ۱۰ و یک پاسخ مؤثر صفر → ۹۱٫۶۶…
    expect(result.score0to100).toBeCloseTo((11 / 12) * 100, 2);
    expect(result.verdict).toBe('label');
  });

  it('آستانه‌های ۷۰/۴۰ با پاسخ‌های یکنواخت نگاشت می‌شوند', () => {
    expect(score(uniformAnswers(gateQuestions, 8)).zone).toBe('green');
    expect(score(uniformAnswers(gateQuestions, 5)).zone).toBe('yellow');
    expect(score(uniformAnswers(gateQuestions, 3)).zone).toBe('red');
    expect(content.gateScoring.zones.map((z) => [z.key, z.min])).toEqual([
      ['green', 70],
      ['yellow', 40],
      ['red', 0],
    ]);
  });

  it('هر محور در خروجی ۴ پاسخ دارد و لیبل نتیجهٔ نمره است، نه Knock-out', () => {
    const result = score(highQualityAnswers(gateQuestions));
    expect(result.dimensionScores.map((d) => [d.code, d.total])).toEqual([
      ['locus_of_control', 4],
      ['agency', 4],
      ['problem_solving', 4],
    ]);
    expect(result.verdict).toBe('label');
    expect(result.knockouts ?? []).toHaveLength(0);
  });
});

describe('گاردهای کیفیت (فقط برای اطمینان)', () => {
  it('ناقص بودن پاسخ‌ها اطمینان را پایین می‌آورد ولی مسیر را متوقف نمی‌کند', () => {
    const result = score(fillAnswers(gateQuestions.slice(0, 6), 9));
    expect(result.completeness).toBeLessThan(1);
    expect(result.confidence).not.toBe('high');
    expect(result.guards.find((g) => g.code === 'completeness')?.triggered).toBe(true);
    expect(result.verdict).toBe('label');
  });

  it('پاسخ‌دهی یکنواخت یا شتاب‌زده فقط گارد اطمینان می‌سازد', () => {
    const straight = score(fillAnswers(gateQuestions, 7));
    expect(straight.guards.find((g) => g.code === 'straight_lining')?.triggered).toBe(true);
    const hasty = score(fillAnswers(gateQuestions, (i) => (i % 2 ? 9 : 4), 800));
    expect(hasty.guards.find((g) => g.code === 'hasty')?.triggered).toBe(true);
    expect(hasty.verdict).toBe('label');
  });

  it('پاسخ ناقص در سؤال‌های معکوس، شناسه و مقدار را نگه می‌دارد', () => {
    const partial = fillAnswers(gateQuestions.slice(0, 2), 8);
    const result = score(partial);
    expect(result.answeredCount).toBe(2);
    expect(result.totalScoredQuestions).toBe(12);
    expect(result.verdict).toBe('label');
  });
});

describe('نسخه‌گذاری و ردیابی‌پذیری', () => {
  it('نسخهٔ فرم و فرمول در نتیجه ثبت می‌شود', () => {
    const result = score(highQualityAnswers(gateQuestions));
    expect(result.formulaVersion).toContain(content.gate.version);
    expect(result.formulaVersion).toContain(content.gateScoring.version);
    expect(result.weighting).toBe('question_level');
  });
});
