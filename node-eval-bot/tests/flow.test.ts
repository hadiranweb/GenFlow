/**
 * تست‌های ماشین وضعیت — مطابق فرایند اصلی:
 *   • ادامهٔ بی‌وقفه از ارزیابی به عارضه‌یابی (بدون نمایش حکم/برچسب)
 *   • هیچ مسدودسازی‌ای وجود ندارد
 *   • ساید دوم: توضیح متنی اختیاری، بدون اثر بر نمره
 *   • آرشیو سریال‌دار و شمارهٔ نشست
 */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { openDb } from '../src/storage/db.js';
import { Repo } from '../src/storage/repo.js';
import { FlowService } from '../src/bot/flow.js';
import { MockLlmProvider } from '../src/llm/mock.js';
import { generateReport } from '../src/report/pipeline.js';
import { testConfig, testContent, testLogger } from './helpers.js';

const content = testContent();
const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'node-eval-flow-'));
const db = openDb(path.join(tmpDir, 'test.db'));
const repo = new Repo(db);
const cfg = testConfig({ reportsDir: path.join(tmpDir, 'reports') });
const flow = new FlowService(repo, content, cfg, testLogger);

const screening = content.gate.sections.flatMap((s) => s.questions);
const diagnostics = content.matrix.sections.flatMap((s) => s.questions);
const TELEGRAM_ID = 900001;

let sessionId = '';

afterAll(() => {
  db.close();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('جریان اصلی — ارزیابی بی‌وقفه و بدون مسدودسازی', () => {
  it('نشست جدید با شمارهٔ ۱ و در انتظار تأیید ساخته می‌شود', () => {
    repo.upsertUser({ telegramId: TELEGRAM_ID, chatId: TELEGRAM_ID, firstName: 'تست' });
    const session = flow.createSession(TELEGRAM_ID);
    sessionId = session.id;
    expect(session.status).toBe('consent_pending');
    expect(session.session_no).toBe(1);
    expect(flow.combinedTotal).toBe(34);
  });

  it('پس از تأیید، پرسش اول نمایش داده می‌شود و پیشرفت پیوسته است', () => {
    const session = repo.getSession(sessionId)!;
    const view = flow.grantConsent(session);
    expect(view.flow).toBe('screening');
    expect(view.displayIndex).toBe(1);
    expect(view.total).toBe(34);
    expect(view.text).toContain('پرسش ۱ از ۳۴');
  });

  it('کلیک کهنه نادیده گرفته می‌شود و مقدار نامعتبر رد می‌شود', () => {
    const current = repo.getSession(sessionId)!;
    expect(flow.submitAnswer(current, 5, 7).kind).toBe('stale');
    expect(flow.submitAnswer(current, 0, 42).kind).toBe('invalid_value');
  });

  it('پاسخ ثبت می‌شود و پرسش جلو می‌رود', () => {
    const outcome = flow.submitAnswer(repo.getSession(sessionId)!, 0, 8);
    expect(outcome.kind).toBe('advanced');
    if (outcome.kind === 'advanced') expect(outcome.view.displayIndex).toBe(2);
    expect(repo.getSessionState(sessionId)!.gateAnswers['s01']!.value).toBe(8);
  });

  it('تکمیل ارزیابی → محاسبهٔ لیبل + ادامهٔ بی‌وقفه به عارضه‌یابی', () => {
    let outcome: ReturnType<typeof flow.submitAnswer> | undefined;
    for (let i = 1; i < screening.length; i += 1) {
      outcome = flow.submitAnswer(repo.getSession(sessionId)!, i, i % 3 === 0 ? 5 : 9);
    }
    expect(outcome?.kind).toBe('screening_completed');
    if (outcome?.kind === 'screening_completed') {
      // لیبل محاسبه شده اما هیچ فیلدی برای نمایش/مسدودسازی نیست
      expect(['green', 'yellow', 'red']).toContain(outcome.gate.zone);
      expect(outcome.gate.verdict).toBe('label');
      expect('blocked' in outcome).toBe(false);
      expect(outcome.nextView.flow).toBe('diagnostics');
      expect(outcome.nextView.displayIndex).toBe(16);
      expect(outcome.nextView.text).toContain('پرسش ۱۶ از ۳۴');
    }
    expect(repo.getSession(sessionId)!.status).toBe('diagnostics_in_progress');
  });

  it('لیبل در پرونده ثبت شده اما در نمای کاربر دیده نمی‌شود', () => {
    const state = repo.getSessionState(sessionId)!;
    expect(state.gateResult).not.toBeNull();
    const view = flow.currentView(state.row)!;
    // هیچ متن ناحیه/برچسب در پیام پرسش‌ها نیست
    for (const zoneText of ['سبز', 'زرد', 'قرمز', 'ناحیه', 'برچسب']) {
      expect(view.text).not.toContain(zoneText);
    }
  });

  it('فرم ارزیابی با سریال آرشیو می‌شود', () => {
    const docs = repo.listDocuments(sessionId);
    const form = docs.find((d) => d.kind === 'form' && JSON.parse(d.payload).stage === 'screening');
    expect(form).toBeDefined();
    expect(form!.serial).toBeGreaterThan(0);
    expect(form!.session_no).toBe(1);
    expect(JSON.parse(form!.payload).label.zone).toBeDefined();
  });

  it('توضیح متنی: شروع، ثبت و بازگشت به همان پرسش بدون تغییر نمره', () => {
    const session = repo.getSession(sessionId)!;
    const before = flow.currentView(session)!;
    expect(before.flow).toBe('diagnostics');
    expect(before.question.response).toBe('range+text');

    const awaiting = flow.beginExplanation(session)!;
    expect(awaiting.awaitingExplanation).toBe(true);
    expect(flow.isAwaitingExplanation(sessionId)).toBe(true);

    const after = flow.submitExplanation(repo.getSession(sessionId)!, 'این مورد را تازه شروع کرده‌ایم.');
    expect(after).not.toBeNull();
    expect(after!.index).toBe(before.index);
    const state = repo.getSessionState(sessionId)!;
    expect(state.matrixAnswers[before.question.code]!.explanation).toContain('تازه شروع');
    expect(state.matrixAnswers[before.question.code]!.value).toBeNull(); // هنوز پاسخ رنجی نداده
    expect(flow.isAwaitingExplanation(sessionId)).toBe(false);
  });

  it('توضیح وارد نمره نمی‌شود: پاسخ رنجی همان پرسش بعداً ثبت می‌شود', () => {
    const session = repo.getSession(sessionId)!;
    const index = session.matrix_cursor;
    const outcome = flow.submitAnswer(session, index, 6);
    expect(outcome.kind).toBe('advanced');
    const code = diagnostics[index]!.code;
    const rec = repo.getSessionState(sessionId)!.matrixAnswers[code]!;
    expect(rec.value).toBe(6);
    expect(rec.explanation).toContain('تازه شروع'); // توضیح حفظ شده
  });

  it('«بقیهٔ پرسش‌ها روی ۰» هم مسیر را متوقف نمی‌کند (لیبل قرمز = بدون مسدودسازی)', () => {
    let outcome: ReturnType<typeof flow.submitAnswer> | undefined;
    for (let i = repo.getSession(sessionId)!.matrix_cursor; i < diagnostics.length; i += 1) {
      outcome = flow.submitAnswer(repo.getSession(sessionId)!, i, 1);
    }
    expect(outcome?.kind).toBe('diagnostics_completed');
    const state = repo.getSessionState(sessionId)!;
    expect(state.row.status).toBe('diagnostics_done');
    expect(state.matrixResult!.band).toBe('critical');
    expect(state.matrixResult!.symptoms.length).toBeGreaterThan(15);
  });

  it('ماتریس و فرم عارضه‌یابی با سریال آرشیو می‌شوند و گزارش ساخته می‌شود', () => {
    const docs = repo.listDocuments(sessionId);
    expect(docs.some((d) => d.kind === 'range_matrix')).toBe(true);
    const form = docs.find((d) => d.kind === 'form' && JSON.parse(d.payload).stage === 'diagnostics');
    expect(form).toBeDefined();
    expect(JSON.parse(form!.payload).explanationsCount).toBeGreaterThanOrEqual(1);
    const report = repo.getReportBySession(sessionId);
    expect(report?.status).toBe('pending');
  });

  it('تولید سند: سند کاربر نباید لیبل ارزیابی را نشان دهد', async () => {
    const state = repo.getSessionState(sessionId)!;
    const report = repo.getReportBySession(sessionId)!;
    const reserved = repo.createDocument({
      id: crypto.randomUUID(),
      sessionId,
      sessionNo: state.row.session_no,
      telegramId: TELEGRAM_ID,
      kind: 'report',
      payload: {},
    });
    const result = await generateReport({
      config: cfg,
      content,
      llm: new MockLlmProvider(content.actions),
      data: {
        reportId: report.id,
        sessionId,
        sessionNo: state.row.session_no,
        serial: reserved.serial,
        generatedAt: new Date(),
        matrix: state.matrixResult!,
        matrixAnswers: state.matrixAnswers,
        gateAnswers: state.gateAnswers,
        gateResult: state.gateResult,
        deepInterpretation: false,
        aiInterpretation: false,
      },
    });

    expect(result.tier).toBe('range_only');
    expect(result.awaitingHumanReview).toBe(false);
    const html = readFileSync(result.htmlPath, 'utf8');
    expect(html).toContain('خلاصهٔ مدیریتی');
    expect(html).toContain('عارضه‌های مشاهده‌شده');
    expect(html).toContain('اولویت‌بندی بر پایهٔ شکاف');
    // لیبل ارزیابی اولیه نباید در سند کاربر باشد
    expect(html).not.toContain('ناحیه');
    expect(html).not.toContain('برچسب');
    expect(html).not.toContain('سقف پرسش');
    // شمارهٔ سری در سند درج می‌شود
    expect(html).toContain('شمارهٔ سری سند');
  });

  it('با کلید «تفسیر عمیق» روشن، سند پیش‌نویس علامت می‌خورد و متن‌ها به مدل می‌روند', async () => {
    const state = repo.getSessionState(sessionId)!;
    const report = repo.getReportBySession(sessionId)!;
    const result = await generateReport({
      config: cfg,
      content,
      llm: new MockLlmProvider(content.actions),
      data: {
        reportId: report.id,
        sessionId,
        sessionNo: state.row.session_no,
        serial: 99,
        generatedAt: new Date(),
        matrix: state.matrixResult!,
        matrixAnswers: state.matrixAnswers,
        gateAnswers: state.gateAnswers,
        gateResult: state.gateResult,
        deepInterpretation: true,
        aiInterpretation: true,
      },
    });
    expect(result.tier).toBe('deep_ai');
    expect(result.awaitingHumanReview).toBe(true);
    expect(result.deepInterpretation).not.toBeNull();
    expect(result.deepInterpretation!.meta.awaitingHumanReview).toBe(true);
  });

  it('گزارش تکراری ساخته نمی‌شود (idempotency)', () => {
    const first = repo.getReportBySession(sessionId)!;
    const again = repo.createOrResetReport({ id: 'ignored', sessionId, telegramId: TELEGRAM_ID });
    expect(again.id).toBe(first.id);
  });

  it('نشست دوم همان کاربر شمارهٔ ۲ می‌گیرد', () => {
    const second = flow.createSession(TELEGRAM_ID);
    expect(second.session_no).toBe(2);
  });

  it('حذف داده: نشست‌ها، اسناد و گزارش‌ها پاک می‌شوند', () => {
    const result = repo.purgeUser(TELEGRAM_ID);
    expect(result.sessions).toBe(2);
    expect(result.documents).toBeGreaterThanOrEqual(3);
    expect(repo.listDocuments(sessionId)).toHaveLength(0);
  });
});
