import path from 'node:path';
import type { AppConfig } from '../src/config.js';
import { loadContent, type ContentBundle } from '../src/domain/content.js';
import { loadQuestionnaire, parseQuestionnaire } from '../src/domain/questions.js';
import { createLogger } from '../src/util/logger.js';
import type { AnswersMap, QuestionDef, QuestionnaireDef } from '../src/domain/types.js';

export const DATA_DIR = path.resolve('data');

export function testContent(): ContentBundle {
  return loadContent(DATA_DIR);
}

/** پرسش‌نامهٔ بایگانی‌شدهٔ «آستانهٔ الگوی ذهنی» (SJT) برای تست موتور قدیمی */
export function testMindsetQuestionnaire(): QuestionnaireDef {
  return loadQuestionnaire(path.join(DATA_DIR, 'questions/gate.mindset.example.yaml'), 'gate', 'sjt_knockout');
}

/** پرسش‌نامهٔ کوچک با پرسش معکوس — برای تست polarity موتور مقیاس */
export function testReverseQuestionnaire(): QuestionnaireDef {
  return parseQuestionnaire(
    `
key: gate
mode: weighted_scale
version: test-1.0.0
title: تست
intro: تست
scale_min: 0
scale_max: 10
sections:
  - code: a
    title: محور الف
    weight: 1.0
    questions:
      - { code: a1, text: مستقیم, polarity: direct, critical: false }
      - { code: a2, text: معکوس, polarity: reverse, critical: false }
  - code: b
    title: محور ب
    weight: 1.0
    questions:
      - { code: b1, text: کلیدی, polarity: direct, critical: true }
`,
    'gate',
  );
}

export function testConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  const base: AppConfig = {
    botToken: '0:test',
    botMode: 'polling',
    publicBaseUrl: '',
    webhookSecret: '',
    webhookPath: '/webhook/telegram',
    httpPort: 0,
    reportLinkSecret: 'test-secret',
    dataDir: DATA_DIR,
    databasePath: ':memory:',
    reportsDir: path.resolve('out/test'),
    llm: { provider: 'mock', baseUrl: '', apiKey: '', model: 'mock', timeoutMs: 1000, maxRetries: 1 },
    notifyAdminOnRedLabel: false,
    adminChatId: null,
    answerTimeoutSeconds: 1800,
    rateLimitPerMinute: 40,
    logLevel: 'error',
  };
  return { ...base, ...overrides };
}

export const testLogger = createLogger('error');

/** پر کردن پاسخ همهٔ پرسش‌ها با یک مقدار یا تابع */
export function fillAnswers(
  questions: Array<{ code: string }>,
  value: number | ((index: number) => number),
  elapsedMs = 8000,
): AnswersMap {
  const answers: AnswersMap = {};
  questions.forEach((q, i) => {
    answers[q.code] = {
      questionCode: q.code,
      value: typeof value === 'function' ? value(i) : value,
      answeredAt: new Date().toISOString(),
      elapsedMs,
    };
  });
  return answers;
}

/** پاسخ‌های «نمرهٔ هدف» با رعایت polarity (برای تست مرزها) */
export function uniformAnswers(questions: QuestionDef[], v: number, elapsedMs = 8000): AnswersMap {
  const answers: AnswersMap = {};
  for (const q of questions) {
    answers[q.code] = {
      questionCode: q.code,
      value: q.polarity === 'reverse' ? 10 - v : v,
      answeredAt: new Date().toISOString(),
      elapsedMs,
    };
  }
  return answers;
}

/** پاسخ‌های باکیفیت (تنوع ۹/۱۰) — تا گارد «خط‌کشی» فعال نشود */
export function highQualityAnswers(questions: QuestionDef[], elapsedMs = 9000): AnswersMap {
  const answers: AnswersMap = {};
  questions.forEach((q, i) => {
    const direct = i % 2 === 0 ? 10 : 9;
    answers[q.code] = {
      questionCode: q.code,
      value: q.polarity === 'reverse' ? 10 - direct : direct,
      answeredAt: new Date().toISOString(),
      elapsedMs,
    };
  });
  return answers;
}

/** پاسخ سناریوهای SJT (موتور بایگانی‌شده) با انتخاب یک سیگنال مشخص */
export function sjtAnswers(
  questionnaire: QuestionnaireDef,
  choice: 'green' | 'yellow' | 'red' | ((axisIndex: number, questionIndex: number) => 'green' | 'yellow' | 'red'),
  elapsedMs = 9000,
): AnswersMap {
  const answers: AnswersMap = {};
  questionnaire.sections.forEach((section, ai) => {
    section.questions.forEach((q, qi) => {
      const wanted = typeof choice === 'function' ? choice(ai, qi) : choice;
      const options = q.options ?? [];
      const opt = options.find((o) => o.signal === wanted);
      if (!opt) throw new Error(`پرسش ${q.code} گزینهٔ ${wanted} ندارد`);
      answers[q.code] = {
        questionCode: q.code,
        value: opt.key,
        signal: opt.signal,
        answeredAt: new Date().toISOString(),
        elapsedMs,
      };
    });
  });
  return answers;
}
