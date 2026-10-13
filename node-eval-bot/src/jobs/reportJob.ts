/**
 * صف کارِ تولید گزارش (in-process).
 *
 * چرا صف؟ تولید گزارش (تماس با مدل + ساخت HTML) کند و خطاپذیر است و نباید
 * پاسخ‌دهی به کاربر را قفل کند. همچنین:
 *  - هر جلسه فقط یک بار پردازش می‌شود (idempotency بر پایهٔ sessionId).
 *  - شکست، صریح در DB و به کاربر اعلام می‌شود و با /report قابل تلاش مجدد است.
 */
import type { AppConfig } from '../config.js';
import type { ContentBundle } from '../domain/content.js';
import type { LlmProvider } from '../llm/types.js';
import type { Logger } from '../util/logger.js';
import type { Repo } from '../storage/repo.js';
import { generateReport } from '../report/pipeline.js';
import { InputFile } from 'grammy';
import type { Bot } from 'grammy';

export class ReportQueue {
  private readonly pending: string[] = [];
  private readonly inFlight = new Set<string>();
  private draining = false;

  constructor(
    private readonly deps: {
      repo: Repo;
      config: AppConfig;
      content: ContentBundle;
      llm: LlmProvider;
      logger: Logger;
      bot: Bot;
      buildCaption: (info: { reportId: string; sessionId: string; htmlPath: string }) => string;
      /** کلیدهای مدیر از دیتابیس (settings) با پیش‌فرض فایل سیاست */
      adminKeys: () => { deepInterpretation: boolean; aiInterpretation: boolean };
    },
  ) {}

  enqueue(sessionId: string): void {
    if (this.inFlight.has(sessionId) || this.pending.includes(sessionId)) return;
    this.pending.push(sessionId);
    void this.drain();
  }

  get size(): number {
    return this.pending.length + this.inFlight.size;
  }

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      while (this.pending.length > 0) {
        const sessionId = this.pending.shift()!;
        this.inFlight.add(sessionId);
        try {
          await this.process(sessionId);
        } catch (err) {
          this.deps.logger.error('پردازش گزارش با خطای پیش‌بینی‌نشده شکست خورد', {
            sessionId,
            error: (err as Error).message,
          });
        } finally {
          this.inFlight.delete(sessionId);
        }
      }
    } finally {
      this.draining = false;
    }
  }

  private async process(sessionId: string): Promise<void> {
    const { repo, config, content, llm, logger, bot } = this.deps;

    const state = repo.getSessionState(sessionId);
    if (!state || !state.gateResult || !state.matrixResult) {
      logger.warn('گزارش برای جلسهٔ ناقص درخواست شد؛ رد شد', { sessionId });
      return;
    }

    if (state.gateAnswers === undefined || Object.keys(state.gateAnswers).length === 0) {
      logger.warn('پاسخ‌های گیت خالی است', { sessionId });
    }

    // اگر گزارش قبلاً ساخته شده، دوباره نساز (idempotency)
    const existing = repo.getReportBySession(sessionId);
    if (existing && existing.status === 'ready' && existing.html_path) {
      logger.info('گزارش قبلاً ساخته شده است؛ ارسال مجدد فایل', { sessionId, reportId: existing.id });
      await this.sendDocument(existing.telegram_id, existing.id, sessionId, existing.html_path);
      return;
    }

    const reportId = existing?.id ?? crypto.randomUUID();
    const report = repo.createOrResetReport({ id: reportId, sessionId, telegramId: state.row.telegram_id });
    repo.setReportStatus(report.id, 'generating');
    repo.updateSessionProgress(sessionId, { status: 'report_generating' });
    repo.logEvent({ type: 'report.generation_started', sessionId, telegramId: state.row.telegram_id, payload: { reportId: report.id } });

    try {
      const adminKeys = this.deps.adminKeys();
      // شمارهٔ سری سند را پیش از تولید رزرو می‌کنیم تا در خود سند درج شود
      const reserved = repo.createDocument({
        id: crypto.randomUUID(),
        sessionId,
        sessionNo: state.row.session_no,
        telegramId: state.row.telegram_id,
        kind: 'report',
        contentHash: null,
        payload: { stage: 'reserved' },
      });

      const result = await generateReport({
        config,
        content,
        llm,
        data: {
          reportId: report.id,
          sessionId,
          sessionNo: state.row.session_no,
          serial: reserved.serial,
          generatedAt: new Date(),
          matrix: state.matrixResult,
          matrixAnswers: state.matrixAnswers,
          gateAnswers: state.gateAnswers,
          gateResult: state.gateResult,
          deepInterpretation: adminKeys.deepInterpretation,
          aiInterpretation: adminKeys.aiInterpretation,
        },
      });

      // آرشیو تفسیرها (رنجی و عمیق) با سریال
      repo.createDocument({
        id: crypto.randomUUID(),
        sessionId,
        sessionNo: state.row.session_no,
        telegramId: state.row.telegram_id,
        kind: 'interpretation',
        contentHash: result.contentHash,
        payload: {
          chosen: result.interpretation,
          rangeOnly: result.rangeInterpretation,
          deep: result.deepInterpretation,
          tier: result.tier,
          awaitingHumanReview: result.awaitingHumanReview,
          adminKeys,
        },
      });
      repo.setReportStatus(reserved.id, 'ready', { content_hash: result.contentHash, html_path: result.htmlPath });

      repo.saveInterpretation(report.id, result.interpretation, result.htmlPath, result.contentHash);
      repo.updateSessionProgress(sessionId, { status: 'report_ready', completedAt: new Date().toISOString() });
      repo.logEvent({
        type: 'report.ready',
        sessionId,
        telegramId: state.row.telegram_id,
        payload: {
          reportId: report.id,
          serial: reserved.serial,
          tier: result.tier,
          awaitingHumanReview: result.awaitingHumanReview,
          llmStatus: result.interpretation.meta.status,
          provider: result.interpretation.meta.provider,
        },
      });

      await this.sendDocument(state.row.telegram_id, report.id, sessionId, result.htmlPath);
      logger.info('گزارش تولید و ارسال شد', { sessionId, reportId: report.id, llmStatus: result.interpretation.meta.status });
    } catch (err) {
      const message = (err as Error).message;
      repo.setReportStatus(report.id, 'failed', { error: message });
      repo.updateSessionProgress(sessionId, { status: 'report_failed' });
      repo.logEvent({ type: 'report.failed', sessionId, telegramId: state.row.telegram_id, payload: { reportId: report.id, error: message } });
      logger.error('تولید گزارش شکست خورد', { sessionId, reportId: report.id, error: message });
      try {
        await bot.api.sendMessage(
          state.row.telegram_id,
          '⚠️ تولید گزارش در این نوبت انجام نشد. پاسخ‌های شما ذخیره شده است؛ با دستور /report دوباره تلاش کنید.',
        );
      } catch {
        /* ارسال پیام خطا هم می‌تواند شکست بخورد؛ نادیده بگیر */
      }
    }
  }

  private async sendDocument(telegramId: number, reportId: string, sessionId: string, htmlPath: string): Promise<void> {
    const { bot } = this.deps;
    const fileName = `report-${sessionId.slice(0, 8)}.html`;
    await bot.api.sendDocument(telegramId, new InputFile(htmlPath, fileName), {
      caption: this.deps.buildCaption({ reportId, sessionId, htmlPath }),
      parse_mode: 'HTML',
    });
  }
}
