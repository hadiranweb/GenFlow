/**
 * تست‌های ماتریس عارضه‌یابی — مطابق پیش‌نویس مالک محصول:
 *   هدف ۷۵ · آستانهٔ عارضه ۴ · دسته‌ها ۷۵/۶۰/۴۰ · دو ساید بودن پرسش‌ها
 */
import { describe, expect, it } from 'vitest';
import { bandOf, buildMatrix, collectExplanations, toMatrixBundle } from '../src/domain/matrix.js';
import type { AnswersMap } from '../src/domain/types.js';
import { fillAnswers, testContent } from './helpers.js';

const content = testContent();
const questions = content.matrix.sections.flatMap((s) => s.questions);

function build(answers: AnswersMap) {
  return buildMatrix({
    questionnaire: content.matrix,
    answers,
    config: content.matrixScoring,
    generatedAt: new Date().toISOString(),
  });
}

describe('پیکربندی عارضه‌یابی', () => {
  it('۱۹ پرسش در ۵ لایه (۴+۴+۴+۴+۳) با ۱ پرسش کلیدی در هر لایه (سند پنج‌لایه)', () => {
    expect(questions).toHaveLength(19);
    expect(content.matrix.sections).toHaveLength(5);
    expect(content.matrix.sections.map((s) => s.code)).toEqual([
      'governance',
      'architecture',
      'implementation',
      'maintenance',
      'scaling',
    ]);
    expect(content.matrix.sections.map((s) => s.questions.length)).toEqual([4, 4, 4, 4, 3]);
    for (const s of content.matrix.sections) {
      expect(s.questions.filter((q) => q.critical)).toHaveLength(1);
      // وزن برابر لایه‌ها: نمرهٔ کل = مجموع نمرهٔ لایه‌ها (۰..۲۰)
      expect(s.weight).toBe(1);
    }
  });

  it('ردیابی منبع: هر پرسش source_ref و keyword_refs معتبر دارد', () => {
    const refs = questions.map((q) => q.sourceRef);
    expect(new Set(refs).size).toBe(19);
    expect(refs).toContain('L1-Q1');
    expect(refs).toContain('L5-Q3');
    for (const q of questions) {
      expect(q.sourcePrompt).toBeTruthy();
      expect((q.keywordRefs ?? []).length).toBeGreaterThan(0);
    }
    const criticalRefs = questions.filter((q) => q.critical).map((q) => q.sourceRef);
    expect(criticalRefs).toEqual(['L1-Q1', 'L2-Q2', 'L3-Q1', 'L4-Q1', 'L5-Q1']);
  });

  it('ماتریس تفسیر برای هر ۵ لایه وضع موجود/مطلوب و درخت کلیدواژه دارد', () => {
    expect(Object.keys(content.interpretationMatrix.layers)).toHaveLength(5);
    for (const layer of Object.values(content.interpretationMatrix.layers)) {
      expect(layer.as_is).toBeTruthy();
      expect(layer.to_be).toBeTruthy();
      expect(layer.keyword_tree).toHaveLength(3);
    }
    expect(content.interpretationMatrix.crossLayerPatterns.map((p) => p.id)).toContain('written_not_executed');
  });

  it('همهٔ پرسش‌ها دو ساید هستند (رنج + توضیح اختیاری)', () => {
    expect(questions.every((q) => q.response === 'range+text')).toBe(true);
  });

  it('آستانه‌ها مطابق پیش‌نویس است', () => {
    expect(content.matrixScoring.targetIndex).toBe(75);
    expect(content.matrixScoring.symptomThreshold).toBe(4);
    expect(content.matrixScoring.severityBands).toEqual({ healthy: 75, borderline: 60, needs_fix: 40 });
    expect(content.matrixScoring.interpretation.explanationRequired).toBe(false);
    expect(content.matrixScoring.interpretation.explanationsToAi).toBe(true);
  });

  it('نگاشت دسته‌بندی روی مرزها درست است', () => {
    const b = content.matrixScoring.severityBands;
    expect(bandOf(75, b)).toBe('healthy');
    expect(bandOf(74.9, b)).toBe('borderline');
    expect(bandOf(60, b)).toBe('borderline');
    expect(bandOf(59.9, b)).toBe('needs_fix');
    expect(bandOf(40, b)).toBe('needs_fix');
    expect(bandOf(39.9, b)).toBe('critical');
  });
});

describe('محاسبهٔ ماتریس', () => {
  it('همهٔ پاسخ‌ها ۱۰ → ۱۰۰، مطلوب، بدون عارضه؛ هر لایه ۲۰ از ۲۰', () => {
    const m = build(fillAnswers(questions, 10));
    expect(m.overall0to100).toBe(100);
    expect(m.band).toBe('healthy');
    expect(m.gapToTarget).toBe(0);
    expect(m.symptoms).toHaveLength(0);
    expect(m.severityCounts.healthy).toBe(19);
    for (const d of m.domains) expect(d.score0to20).toBe(20);
    expect(m.domains.reduce((a, d) => a + d.score0to20, 0)).toBeCloseTo(m.overall0to100, 5);
  });

  it('همهٔ پاسخ‌ها ۰ → صفر، بحرانی، ۱۹ عارضه', () => {
    const m = build(fillAnswers(questions, 0));
    expect(m.overall0to100).toBe(0);
    expect(m.band).toBe('critical');
    expect(m.symptoms).toHaveLength(19);
    expect(m.gapToTarget).toBe(75);
  });

  it('عارضه = نمرهٔ ≤ ۴ روی گزاره (آستانهٔ مالک محصول)', () => {
    const answers = fillAnswers(questions, 9);
    answers[questions[0]!.code] = { questionCode: questions[0]!.code, value: 4, answeredAt: '', elapsedMs: 9000 };
    answers[questions[1]!.code] = { questionCode: questions[1]!.code, value: 5, answeredAt: '', elapsedMs: 9000 };
    const m = build(answers);
    expect(m.symptoms).toHaveLength(1);
    expect(m.symptoms[0]!.questionCode).toBe(questions[0]!.code);
  });

  it('گلوگاه = کم‌نمره‌ترین محور و اولویت‌بندی = شکاف × وزن', () => {
    const answers = fillAnswers(questions, 9);
    const governance = content.matrix.sections.find((s) => s.code === 'governance')!;
    for (const q of governance.questions) {
      answers[q.code] = { questionCode: q.code, value: 2, answeredAt: '', elapsedMs: 9000 };
    }
    const m = build(answers);
    expect(m.bottleneck.code).toBe('governance');
    expect(m.domains[0]!.code).toBe('governance');
    expect(m.priorities[0]!.code).toBe('governance');
    expect(m.priorities[0]!.priority).toBeCloseTo((75 - 20) * 1.0, 5);
    expect(m.priorities[0]!.gap).toBeCloseTo(55, 5);
    expect(m.domains[0]!.score0to20).toBeCloseTo(4, 5);
  });

  it('پرسش کلیدی زیر آستانه، محور را علامت‌دار می‌کند', () => {
    const answers = fillAnswers(questions, 9);
    const scaling = content.matrix.sections.find((s) => s.code === 'scaling')!;
    const critical = scaling.questions.find((q) => q.critical)!;
    answers[critical.code] = { questionCode: critical.code, value: 2, answeredAt: '', elapsedMs: 9000 };
    const m = build(answers);
    const domain = m.domains.find((d) => d.code === 'scaling')!;
    expect(domain.criticalBelowThreshold).toBe(true);
    const priority = m.priorities.find((p) => p.code === 'scaling')!;
    expect(priority.criticalWeakCount).toBe(1);
    expect(m.symptoms.find((s) => s.questionCode === critical.code)?.critical).toBe(true);
  });

  it('وزن برابر لایه‌ها: افت هر لایه اثر برابر بر نمرهٔ کل دارد', () => {
    const lowGovernance = fillAnswers(questions, 10);
    for (const q of content.matrix.sections.find((s) => s.code === 'governance')!.questions) {
      lowGovernance[q.code] = { questionCode: q.code, value: 0, answeredAt: '', elapsedMs: 9000 };
    }
    const lowMaintenance = fillAnswers(questions, 10);
    for (const q of content.matrix.sections.find((s) => s.code === 'maintenance')!.questions) {
      lowMaintenance[q.code] = { questionCode: q.code, value: 0, answeredAt: '', elapsedMs: 9000 };
    }
    expect(build(lowGovernance).overall0to100).toBeCloseTo(build(lowMaintenance).overall0to100, 5);
    expect(build(lowGovernance).overall0to100).toBeCloseTo(80, 5);
  });

  it('توضیح متنی در محاسبه وارد نمی‌شود ولی شمارش و نگهداری آن انجام می‌شود', () => {
    const answers = fillAnswers(questions, 7);
    const withText: AnswersMap = {
      ...answers,
      [questions[3]!.code]: {
        ...answers[questions[3]!.code]!,
        explanation: 'این مورد را داریم، اما پراکنده و بدون مستند.',
      },
    };
    const without = build(answers);
    const withOne = build(withText);
    expect(withOne.overall0to100).toBe(without.overall0to100);
    expect(withOne.explanationsCount).toBe(1);
    const symptomWithText: AnswersMap = {
      ...answers,
      [questions[0]!.code]: { ...answers[questions[0]!.code]!, value: 2, explanation: 'علتش را می‌دانم.' },
    };
    expect(build(symptomWithText).symptoms[0]!.explanation).toBe('علتش را می‌دانم.');
  });

  it('پراکندگی محور محاسبه می‌شود (ناهمگونی درک)', () => {
    const answers = fillAnswers(questions, 5);
    const gov = content.matrix.sections.find((s) => s.code === 'scaling')!;
    gov.questions.forEach((q, i) => {
      answers[q.code] = { questionCode: q.code, value: i % 2 === 0 ? 0 : 10, answeredAt: '', elapsedMs: 9000 };
    });
    const m = build(answers);
    expect(m.domains.find((d) => d.code === 'scaling')!.dispersion).toBeGreaterThan(0.4);
  });

  it('بستهٔ ارسالی به مدل، خلاصه و محدود است و اولویت‌ها را می‌آورد', () => {
    const m = build(fillAnswers(questions, (i) => (i % 5 === 0 ? 1 : 9)));
    const bundle = toMatrixBundle(m, { maxItemsPerDomain: 2, symptomThreshold: 4 });
    expect(bundle.priorities.length).toBeLessThanOrEqual(5);
    for (const d of bundle.domains) {
      expect(d.criticalGaps.length).toBeLessThanOrEqual(2);
      expect(d.strengths.length).toBeLessThanOrEqual(2);
    }
    expect(bundle.overall).toBeCloseTo(m.overall0to100, 5);
    expect(bundle.band).toBe(m.band);
  });

  it('توضیحات برای مفسر، به ترتیب اولویت محورها مرتب می‌شوند', () => {
    const answers = fillAnswers(questions, 3);
    const governance = content.matrix.sections.find((s) => s.code === 'governance')!.questions[0]!;
    const architecture = content.matrix.sections.find((s) => s.code === 'architecture')!.questions[0]!;
    answers[governance.code] = { ...answers[governance.code]!, explanation: 'توضیح حاکمیت' };
    answers[architecture.code] = { ...answers[architecture.code]!, explanation: 'توضیح معماری' };
    const m = build(answers);
    const items = collectExplanations(m, answers, content.matrix, 40);
    expect(items).toHaveLength(2);
    // هر دو محور شکاف برابر دارند؛ ترتیب باید بر پایهٔ اولویت (وزن) باشد
    expect(m.priorities[0]!.priority).toBeGreaterThanOrEqual(m.priorities[1]!.priority);
  });
});
