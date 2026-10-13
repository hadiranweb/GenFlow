/**
 * نقطهٔ ورود سرویس.
 * ترتیب راه‌اندازی: تنظیمات → محتوا (اعتبارسنجی سخت‌گیرانه) → DB → مدل → ربات → HTTP
 * هر خطا در راه‌اندازی، سرویس را متوقف می‌کند (fail-fast) تا خرابی در وسط
 * گفت‌وگوی کاربر کشف نشود.
 */
import path from 'node:path';
import { Bot } from 'grammy';
import { loadConfig } from './config.js';
import { loadContent } from './domain/content.js';
import { createLogger } from './util/logger.js';
import { openDb } from './storage/db.js';
import { Repo } from './storage/repo.js';
import { createLlmProvider } from './llm/index.js';
import { FlowService } from './bot/flow.js';
import { registerBotHandlers } from './bot/bot.js';
import { ReportQueue } from './jobs/reportJob.js';
import { createHttpServer } from './http/server.js';
import { reportCaption } from './bot/messages.js';
import { bandLabel } from './domain/matrix.js';

async function main(): Promise<void> {
  const startedAt = Date.now();
  const config = loadConfig();
  const logger = createLogger(config.logLevel);
  const log = logger.child({ component: 'boot' });

  log.info('راه‌اندازی سرویس نود ارزیابی', {
    mode: config.botMode,
    llmProvider: config.llm.provider,
    dataDir: config.dataDir,
  });

  // ۱) محتوا — اگر پرسش‌نامه/تنظیمات ناحیه نامعتبر باشد، همین‌جا متوقف می‌شویم
  const content = loadContent(config.dataDir);
  log.info('محتوا بارگذاری شد', {
    screeningQuestions: content.gate.sections.reduce((a, s) => a + s.questions.length, 0),
    diagnosticsQuestions: content.matrix.sections.reduce((a, s) => a + s.questions.length, 0),
    gateVersion: content.gate.version,
    matrixVersion: content.matrix.version,
    gateScoringVersion: content.gateScoring.version,
    matrixScoringVersion: content.matrixScoring.version,
    weighting: content.gateScoring.weighting,
  });

  // ۲) ذخیره‌سازی
  const db = openDb(config.databasePath);
  const repo = new Repo(db);

  // ۳) مدل زبانی (فقط برای تفسیر)
  const llm = createLlmProvider(config, content, (level, message, extra) => logger[level](message, extra ?? {}));

  // ۴) ربات (در حالت disabled فقط برای ساخت لینک/دکمه لازم است، راه‌اندازی نمی‌شود)
  const bot = new Bot(config.botToken);
  const flow = new FlowService(repo, content, config, logger.child({ component: 'flow' }));
  // کلیدهای مدیر: مقدار فایل سیاست، قابل بازنویسی در جدول settings دیتابیس
  // (تا زمان ساخت داشبورد، تغییرشان با یک UPDATE ساده در دیتابیس انجام می‌شود)
  repo.setSettingIfMissing('deep_interpretation', String(content.matrixScoring.adminKeys.deepInterpretation));
  repo.setSettingIfMissing('ai_interpretation', String(content.matrixScoring.adminKeys.aiInterpretation));
  const adminKeys = () => ({
    deepInterpretation: repo.getBoolSetting('deep_interpretation', content.matrixScoring.adminKeys.deepInterpretation),
    aiInterpretation: repo.getBoolSetting('ai_interpretation', content.matrixScoring.adminKeys.aiInterpretation),
  });

  const reportQueue = new ReportQueue({
    repo,
    config,
    content,
    llm,
    logger: logger.child({ component: 'report' }),
    bot,
    adminKeys,
    buildCaption: ({ reportId, sessionId }) => {
      const report = repo.getReport(reportId);
      const state = repo.getSessionState(sessionId);
      const url = config.publicBaseUrl ? `${config.publicBaseUrl.replace(/\/+$/, '')}/reports/${reportId}` : undefined;
      const interpretation = report?.interpretation ? JSON.parse(report.interpretation) : null;
      return reportCaption({
        sessionNo: state?.row.session_no ?? 1,
        bandLabel: state?.matrixResult ? bandLabel(state.matrixResult.band) : 'نامشخص',
        score: state?.matrixResult?.overall0to100 ?? 0,
        explanationsCount: state?.matrixResult?.explanationsCount ?? 0,
        publicUrl: url,
        tier: interpretation?.meta?.tier ?? 'range_only',
        awaitingHumanReview: Boolean(interpretation?.meta?.awaitingHumanReview),
      });
    },
  });

  registerBotHandlers({ bot, repo, config, content, logger, flow, reportQueue });

  // ۵) سرور HTTP (سلامت + لینک دانلود)
  const server = createHttpServer({ config, logger, repo, bot, reportQueue, startedAt });
  await new Promise<void>((resolve) => server.listen(config.httpPort, resolve));
  log.info('سرور HTTP بالا آمد', { port: config.httpPort });

  // ۶) شروع دریافت به‌روزرسانی‌ها
  if (config.botMode === 'disabled') {
    log.warn('BOT_MODE=disabled — ربات تلگرام راه‌اندازی نشد (فقط HTTP فعال است)');
  }

  if (config.botMode !== 'disabled') await bot.api.setMyCommands([
    { command: 'start', description: 'شروع گفت‌وگوی جدید' },
    { command: 'resume', description: 'ادامهٔ گفت‌وگوی ناتمام' },
    { command: 'report', description: 'دریافت گزارش' },
    { command: 'status', description: 'وضعیت پرونده' },
    { command: 'help', description: 'راهنما' },
    { command: 'about', description: 'دربارهٔ این ابزار' },
    { command: 'cancel', description: 'لغو گفت‌وگو' },
    { command: 'delete', description: 'حذف داده‌های من' },
  ]);

  if (config.botMode === 'webhook') {
    const webhookUrl = `${config.publicBaseUrl.replace(/\/+$/, '')}${config.webhookPath}`;
    await bot.api.setWebhook(webhookUrl, { secret_token: config.webhookSecret, drop_pending_updates: false });
    log.info('وب‌هوک تنظیم شد', { webhookUrl });
  } else if (config.botMode === 'disabled') {
    // هیچ اتصالی به تلگرام برقرار نمی‌شود
  } else {
    await bot.api.deleteWebhook({ drop_pending_updates: false });
    void bot.start({
      drop_pending_updates: false,
      onStart: (info) => log.info('ربات در حالت polling فعال شد', { username: info.username }),
    });
  }

  // ۷) خاموشی تدریجی
  const shutdown = async (signal: string): Promise<void> => {
    log.info('دریافت سیگنال خاموشی', { signal });
    try {
      if (config.botMode === 'polling') await bot.stop();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      db.close();
    } catch (err) {
      log.error('خطا در خاموشی', { error: (err as Error).message });
    }
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    log.error('unhandledRejection', { reason: reason instanceof Error ? reason.message : String(reason) });
  });
  process.on('uncaughtException', (err) => {
    log.error('uncaughtException', { error: err.message, stack: err.stack });
  });

  log.info('سرویس آماده است', { dataDir: path.resolve(config.dataDir) });
}

main().catch((err) => {
  process.stderr.write(`❌ راه‌اندازی ناموفق: ${(err as Error).message}\n`);
  process.exit(1);
});
