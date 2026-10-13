/**
 * تست‌های امنیت و ساختار سند HTML.
 * اصل‌ها: همهٔ متن‌های نامعتمد escape شوند؛ لیبل ارزیابی در سند کاربر نباشد؛
 * بخش‌های اصلی سند وجود داشته باشند.
 */
import { describe, expect, it } from 'vitest';
import { scoreGate } from '../src/domain/scoring.js';
import { buildMatrix, collectExplanations, toMatrixBundle } from '../src/domain/matrix.js';
import { renderReportHtml } from '../src/report/html.js';
import { escapeHtml } from '../src/util/html.js';
import type { AnswersMap, Interpretation } from '../src/domain/types.js';
import { fillAnswers, testContent } from './helpers.js';

const content = testContent();
const questions = content.matrix.sections.flatMap((s) => s.questions);

function makeInput(interpretation: Interpretation, answers?: AnswersMap) {
  const matrixAnswers = answers ?? fillAnswers(questions, 6);
  const matrix = buildMatrix({
    questionnaire: content.matrix,
    answers: matrixAnswers,
    config: content.matrixScoring,
    generatedAt: '2026-10-12T09:00:00Z',
  });
  return {
    reportId: '00000000-1111-2222-3333-444444444444',
    sessionId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    sessionNo: 3,
    serial: 42,
    generatedAt: new Date('2026-10-12T09:00:00Z'),
    matrix,
    matrixQuestionnaire: content.matrix,
    matrixScoring: content.matrixScoring,
    interpretationMatrix: content.interpretationMatrix,
    matrixAnswers,
    explanations: collectExplanations(matrix, matrixAnswers, content.matrix, 40),
    interpretation,
    contentHash: 'f'.repeat(64),
  };
}

const malicious: Interpretation = {
  headline: '<script>alert("headline")</script>',
  verdict: {
    band: 'borderline',
    statement: '"><img src=x onerror=alert(1)>',
    confidence: 'medium',
    needsConversation: true,
  },
  narrative: ['<b>تزریق</b> & <script>x</script>'],
  strengths: [{ title: '<iframe src=evil>', evidence: '&', implication: '"' }],
  risks: [
    { title: '<svg onload=alert(2)>', severity: 'high', evidence: '<script>', implication: '</script>', mitigation: 'a & b' },
  ],
  bottlenecks: [{ domainCode: 'governance', domainTitle: '<img>', score0to100: 30, why: '<script>' }],
  inconsistencies: ['<script>inconsistency</script>'],
  openQuestions: ['<script>open</script>'],
  nextActions: [{ title: '<a href=javascript:alert(1)>click</a>', why: '<x>', ownerRole: '<y>', horizon: 'کوتاه‌مدت' }],
  limitations: ['<script>lim</script>'],
  meta: {
    provider: 'mock',
    model: '<model>',
    status: 'ok',
    tier: 'range_only',
    awaitingHumanReview: false,
    generatedAt: new Date().toISOString(),
  },
};

describe('امنیت سند', () => {
  it('هیچ تگ تزریق‌شده‌ای در HTML نمی‌ماند', () => {
    const html = renderReportHtml(makeInput(malicious));
    expect(html).not.toContain('<script>alert("headline")</script>');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<svg onload');
    expect(html).not.toContain('<iframe src=evil>');
    expect(html).not.toContain('<a href=javascript:');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;svg');
  });

  it('توضیح متنی کاربر هم escape می‌شود', () => {
    const answers = fillAnswers(questions, 3);
    const code = questions[0]!.code;
    answers[code] = { ...answers[code]!, explanation: '<script>alert("text")</script> & <img src=x>' };
    const html = renderReportHtml(makeInput(malicious, answers));
    expect(html).not.toContain('<script>alert("text")</script>');
    expect(html).not.toContain('<img src=x>');
    expect(html).toContain('&lt;script&gt;alert(&quot;text&quot;)&lt;/script&gt;');
  });

  it('escapeHtml کاراکترهای حساس را تبدیل می‌کند', () => {
    expect(escapeHtml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;');
  });
});

describe('ساختار سند', () => {
  const html = renderReportHtml(
    makeInput({ ...malicious, headline: 'سرخط', verdict: { ...malicious.verdict, statement: 'حکم' } }),
  );

  it('بخش‌های اصلی سند وجود دارند', () => {
    for (const section of [
      'خلاصهٔ مدیریتی',
      'تصویر وضع موجود',
      'اولویت‌بندی بر پایهٔ شکاف',
      'عارضه‌های مشاهده‌شده',
      'تحلیل تفصیلی',
      'نقاط قوت',
      'ناسازگاری عدد و توضیح',
      'اقدام‌های پیشنهادی',
      'نیازمند گفت‌وگو',
      'پیوست ۱ — تنظیمات محاسبه',
      'پیوست ۲ — پاسخ‌های خام و توضیحات',
    ]) {
      expect(html).toContain(section);
    }
  });

  it('جدول گزارش ماتریسی شکاف سند پنج‌لایه (As-Is/To-Be/راهکار) در سند هست', () => {
    expect(html).toContain('گزارش ماتریسی شکاف');
    expect(html).toContain('وضعیت موجود (As-Is)');
    expect(html).toContain('وضعیت مطلوب (To-Be)');
    // متن مرجع ماتریس تفسیر برای لایه‌ها
    expect(html).toContain('تله متخصص');
    expect(html).toContain('گلوگاه بحرانی فعلی');
    expect(html).toContain('از ۲۰');
  });

  it('لیبل ارزیابی اولیه در سند کاربر نیست', () => {
    for (const forbidden of ['ناحیه', 'برچسب', 'سقف پرسش', 'ارزیابی اولیه:', 'Knock']) {
      expect(html).not.toContain(forbidden);
    }
  });

  it('شمارهٔ سری، نشست و اثر انگشت محتوا در سند درج می‌شوند', () => {
    expect(html).toContain('شمارهٔ سری سند');
    expect(html).toContain('۴۲');
    expect(html).toContain('شمارهٔ ۳');
    expect(html).toContain('f'.repeat(64));
  });

  it('عارضه‌ها با نمره و توضیح کاربر در جدول می‌آیند', () => {
    const answers = fillAnswers(questions, 2);
    answers[questions[0]!.code] = { ...answers[questions[0]!.code]!, explanation: 'علت مشخص است.' };
    const withSymptoms = renderReportHtml(makeInput({ ...malicious, verdict: { ...malicious.verdict, statement: 'ح' } }, answers));
    expect(withSymptoms).toContain('علت مشخص است.');
    expect(withSymptoms).toContain('عارضهٔ مشاهده‌شده');
  });

  it('وقتی تفسیر مدل انجام نشده، صریح در سند اعلام می‌شود', () => {
    const fallback = renderReportHtml(
      makeInput({
        ...malicious,
        headline: 'سرخط',
        verdict: { ...malicious.verdict, statement: 'حکم' },
        meta: { ...malicious.meta, status: 'fallback', error: 'timeout' },
      }),
    );
    expect(fallback).toContain('تفسیر با مدل زبانی در این نوبت انجام نشد');
  });

  it('پیش‌نویس بودن سند در مسیر عمیق اعلام می‌شود', () => {
    const deep = renderReportHtml(
      makeInput({
        ...malicious,
        headline: 'سرخط',
        verdict: { ...malicious.verdict, statement: 'حکم' },
        meta: { ...malicious.meta, tier: 'deep_ai', awaitingHumanReview: true },
      }),
    );
    expect(deep).toContain('مفسر عمیق');
    expect(deep).toContain('پیش‌نویس');
  });
});

describe('گیت ارزیابی در سند استفاده نمی‌شود', () => {
  it('گزارش پیگیری‌شدهٔ گیت هیچ اثری در سند ندارد', () => {
    const gate = scoreGate({
      questionnaire: content.gate,
      answers: fillAnswers(content.gate.sections.flatMap((s) => s.questions), 1),
      config: content.gateScoring,
    });
    expect(gate.zone).toBe('red'); // لیبل قرمز
    const html = renderReportHtml(
      makeInput({ ...malicious, headline: 'سرخط', verdict: { ...malicious.verdict, statement: 'حکم' } }),
    );
    // سند بر اساس ماتریس ساخته می‌شود، نه لیبل
    expect(html).toContain('خلاصهٔ مدیریتی');
    expect(html).not.toContain('🔴');
  });
});
