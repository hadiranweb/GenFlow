/**
 * لایهٔ تلگرام: دستورها، دکمه‌ها و اتصال آن‌ها به موتور جریان.
 *
 * محافظ‌ها:
 *  ۱) قفل به‌ازای هر کاربر → پردازش سریالی به‌روزرسانی‌ها (ضد پرش پرسش)
 *  ۲) محدودکنندهٔ نرخ → ضد سوءاستفاده/اسپم
 *  ۳) idempotency کلیک‌ها → کلیک کهنه فقط یک توست می‌گیرد و وضعیت را تغییر نمی‌دهد
 *
 * نکته: هیچ پیامی «حکم/لیبل» به کاربر نشان نمی‌دهد؛ لیبل فقط در پرونده و دیتابیس است.
 */
import { Bot, InlineKeyboard, InputFile, type Context } from 'grammy';
import type { AppConfig } from '../config.js';
import type { ContentBundle } from '../domain/content.js';
import type { Logger } from '../util/logger.js';
import { KeyedMutex, RateLimiter } from '../util/mutex.js';
import type { Repo } from '../storage/repo.js';
import type { ReportQueue } from '../jobs/reportJob.js';
import { FlowService, type PromptView } from './flow.js';
import {
  CB,
  aboutText,
  consentDeclinedText,
  consentKeyboard,
  consentText,
  diagnosticsCompletedText,
  explanationSavedText,
  helpText,
  unfinishedSessionKeyboard,
  unfinishedSessionText,
  isPlausibleExplanation,
  parseTextAnswer,
  reportCaption,
} from './messages.js';
import { bandLabel } from '../domain/matrix.js';
import { toPersianDigits } from '../util/time.js';

export interface BotDeps {
  bot: Bot;
  repo: Repo;
  config: AppConfig;
  content: ContentBundle;
  logger: Logger;
  flow: FlowService;
  reportQueue: ReportQueue;
}

export function registerBotHandlers(deps: BotDeps): void {
  const { bot, repo, config, content, logger, flow, reportQueue } = deps;
  const mutex = new KeyedMutex();
  const limiter = new RateLimiter(config.rateLimitPerMinute);
  const log = logger.child({ component: 'bot' });

  const sendText = async (
    ctx: Context,
    text: string,
    opts: { keyboard?: InlineKeyboard; editMessageId?: number } = {},
  ): Promise<void> => {
    const chatId = ctx.chat!.id;
    const replyMarkup = opts.keyboard ? { reply_markup: opts.keyboard } : {};
    if (opts.editMessageId !== undefined) {
      try {
        await ctx.api.editMessageText(chatId, opts.editMessageId, text, { parse_mode: 'HTML', ...replyMarkup });
        return;
      } catch (err) {
        log.debug('ویرایش پیام ناموفق بود؛ ارسال پیام جدید', { error: (err as Error).message });
      }
    }
    await ctx.api.sendMessage(chatId, text, { parse_mode: 'HTML', ...replyMarkup });
  };

  const sendView = async (ctx: Context, view: PromptView, editMessageId?: number): Promise<void> => {
    await sendText(ctx, view.text, {
      keyboard: view.keyboard,
      ...(editMessageId !== undefined ? { editMessageId } : {}),
    });
  };

  const sendReportFile = async (ctx: Context, reportId: string, sessionId: string, htmlPath: string): Promise<void> => {
    const state = repo.getSessionState(sessionId);
    const report = repo.getReport(reportId);
    const interpretation = report?.interpretation ? JSON.parse(report.interpretation) : null;
    const url =
      config.publicBaseUrl && config.reportLinkSecret
        ? `${config.publicBaseUrl.replace(/\/+$/, '')}/reports/${reportId}`
        : undefined;

    await ctx.api.sendDocument(ctx.chat!.id, new InputFile(htmlPath, `report-${sessionId.slice(0, 8)}.html`), {
      caption: reportCaption({
        sessionNo: state?.row.session_no ?? 1,
        bandLabel: state?.matrixResult ? bandLabel(state.matrixResult.band) : 'نامشخص',
        score: state?.matrixResult?.overall0to100 ?? 0,
        explanationsCount: state?.matrixResult?.explanationsCount ?? 0,
        publicUrl: url,
        tier: interpretation?.meta?.tier ?? 'range_only',
        awaitingHumanReview: Boolean(interpretation?.meta?.awaitingHumanReview),
      }),
      parse_mode: 'HTML',
    });
    repo.logEvent({ type: 'report.sent', sessionId, payload: { reportId } });
  };

  // ------------------------------------------------------------------ /start
  bot.command('start', async (ctx) => {
    const from = ctx.from!;
    repo.upsertUser({
      telegramId: from.id,
      chatId: ctx.chat!.id,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
    });
    repo.logEvent({ type: 'command.start', telegramId: from.id });

    const active = flow.activeSession(from.id);
    if (active && active.status !== 'consent_pending') {
      const answered = active.gate_cursor + active.matrix_cursor;
      await ctx.reply(unfinishedSessionText(active.session_no, answered, flow.combinedTotal), {
        parse_mode: 'HTML',
        reply_markup: unfinishedSessionKeyboard(),
      });
      return;
    }
    const session = flow.createSession(from.id);
    await ctx.reply(consentText(flow.combinedTotal), {
      parse_mode: 'HTML',
      reply_markup: consentKeyboard(),
    });
    log.info('نشست جدید ساخته شد', { sessionId: session.id, sessionNo: session.session_no, telegramId: from.id });
  });

  // ---------------------------------------------------------------- /resume
  bot.command('resume', async (ctx) => {
    const from = ctx.from!;
    const session = flow.activeSession(from.id);
    if (!session) {
      await ctx.reply('گفت‌وگوی ناتمامی ندارید. با /start شروع کنید.');
      return;
    }
    if (session.status === 'consent_pending') {
      await ctx.reply(consentText(flow.combinedTotal), { parse_mode: 'HTML', reply_markup: consentKeyboard() });
      return;
    }
    const view = flow.resumeView(session);
    if (!view) {
      await ctx.reply('وضعیت این پرونده اجازهٔ ادامه نمی‌دهد. با /status ببینید یا /start کنید.');
      return;
    }
    const minutesAgo = Math.round((Date.now() - new Date(session.updated_at).getTime()) / 60000);
    if (minutesAgo >= Math.round(config.answerTimeoutSeconds / 60)) {
      await ctx.reply(`⏱ آخرین فعالیت شما ${toPersianDigits(minutesAgo)} دقیقه پیش بوده است؛ از همان‌جا ادامه می‌دهیم.`);
    }
    await sendView(ctx, view);
  });

  // ----------------------------------------------------------------- /status
  bot.command('status', async (ctx) => {
    const from = ctx.from!;
    const session =
      flow.activeSession(from.id) ??
      repo.getLatestSession(from.id, [
        'diagnostics_done',
        'report_generating',
        'report_ready',
        'report_failed',
        'cancelled',
      ]);
    if (!session) {
      await ctx.reply('پرونده‌ای برای شما ثبت نشده است. با /start شروع کنید.');
      return;
    }
    let where = 'نامشخص';
    if (session.status === 'consent_pending') where = 'در انتظار تأیید شروع';
    else if (session.status === 'screening_in_progress') where = `پرسش ${toPersianDigits(session.gate_cursor + 1)} از ${toPersianDigits(flow.combinedTotal)}`;
    else if (session.status === 'diagnostics_in_progress') where = `پرسش ${toPersianDigits(flow.screeningCount + session.matrix_cursor + 1)} از ${toPersianDigits(flow.combinedTotal)}`;
    else if (session.status === 'diagnostics_done' || session.status === 'report_generating') where = 'سند در حال ساخت';
    else if (session.status === 'report_ready') where = 'سند آماده است (/report)';
    else if (session.status === 'report_failed') where = 'ساخت سند ناموفق بود (/report برای تلاش مجدد)';
    else if (session.status === 'cancelled') where = 'لغو شده';
    const docs = repo.listDocuments(session.id);
    await ctx.reply(
      `📌 پروندهٔ جاری: <b>${where}</b>\n` +
        `نشست شمارهٔ ${toPersianDigits(session.session_no)} · اسناد آرشیوی: ${toPersianDigits(docs.length)}\n` +
        `شناسه: <code>${session.id}</code>`,
      { parse_mode: 'HTML' },
    );
  });

  // ----------------------------------------------------------------- /report
  bot.command('report', async (ctx) => {
    const from = ctx.from!;
    const latest = repo.getLatestReport(from.id);
    if (!latest) {
      await ctx.reply('سندی برای شما ثبت نشده است. با /start شروع کنید.');
      return;
    }
    if (latest.status === 'ready' && latest.html_path) {
      await sendReportFile(ctx, latest.id, latest.session_id, latest.html_path);
      return;
    }
    if (latest.status === 'failed' || latest.status === 'pending') {
      await ctx.reply('⏳ درخواست ساخت مجدد سند ثبت شد.');
      reportQueue.enqueue(latest.session_id);
      return;
    }
    await ctx.reply('سند شما در حال ساخت است؛ چند لحظه بعد دوباره /report را بزنید.');
  });

  bot.command('about', async (ctx) => {
    await ctx.reply(aboutText(), { parse_mode: 'HTML' });
  });

  bot.command('help', async (ctx) => {
    const session = flow.activeSession(ctx.from!.id);
    if (session) repo.bumpBehavior(session.id, { helpViews: 1 });
    await ctx.reply(helpText(), { parse_mode: 'HTML' });
  });

  bot.command('cancel', async (ctx) => {
    const from = ctx.from!;
    const session = flow.activeSession(from.id);
    if (!session) {
      await ctx.reply('گفت‌وگوی فعالی برای لغو وجود ندارد.');
      return;
    }
    flow.cancelSession(session);
    await ctx.reply('✋ گفت‌وگو لغو شد. با /start می‌توانید پروندهٔ جدید بسازید.');
  });

  bot.command('delete', async (ctx) => {
    const from = ctx.from!;
    const result = repo.purgeUser(from.id);
    repo.logEvent({ type: 'user.purged', telegramId: from.id, payload: result });
    await ctx.reply(
      `🗑 داده‌های شما حذف شد (${toPersianDigits(result.sessions)} نشست · ` +
        `${toPersianDigits(result.documents)} سند آرشیوی · ${toPersianDigits(result.reports)} گزارش).\n` +
        'فایل‌های دانلودشدهٔ قبلی روی دستگاه خودتان باقی می‌ماند؛ آن‌ها را هم پاک کنید.',
    );
  });

  // -------------------------------------------------------------- callbacks
  bot.callbackQuery(/^consent:(yes|no)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const from = ctx.from;
    if (ctx.match[1] === 'no') {
      await ctx.editMessageText(consentDeclinedText()).catch(() => undefined);
      return;
    }
    const session = flow.activeSession(from.id);
    if (!session) {
      await ctx.reply('پروندهٔ فعالی پیدا نشد. /start را بزنید.');
      return;
    }
    const view = flow.grantConsent(session);
    await ctx.editMessageText('✅ ثبت شد. شروع می‌کنیم…').catch(() => undefined);
    await sendView(ctx, view);
  });

  bot.callbackQuery(/^a:(\d+):(skip|\d{1,2})$/, async (ctx) => {
    const from = ctx.from;
    const index = Number(ctx.match[1]);
    const rawValue = ctx.match[2]!;
    const value: number | null = rawValue === 'skip' ? null : Number(rawValue);

    const session = flow.activeSession(from.id);
    if (!session) {
      await ctx.answerCallbackQuery({ text: 'پروندهٔ فعالی نیست. /start را بزنید.', show_alert: true });
      return;
    }

    const outcome = flow.submitAnswer(session, index, value);
    if (outcome.kind === 'stale') {
      await ctx.answerCallbackQuery({ text: 'این پرسش قبلاً ثبت شده است؛ پیام جاری را ببینید.' });
      return;
    }
    if (outcome.kind === 'invalid_value') {
      await ctx.answerCallbackQuery({ text: 'مقدار نامعتبر' });
      repo.bumpBehavior(session.id, { invalidAttempts: 1 });
      return;
    }
    if (outcome.kind === 'not_active') {
      await ctx.answerCallbackQuery({ text: 'این پرونده در حالت پاسخ‌دهی نیست.' });
      return;
    }

    await ctx.answerCallbackQuery();
    const messageId = ctx.callbackQuery.message?.message_id;

    if (outcome.kind === 'advanced') {
      await sendView(ctx, outcome.view, messageId);
      return;
    }
    if (outcome.kind === 'screening_completed') {
      // ادامهٔ بی‌وقفه — هیچ نتیجه/برچسبی نمایش داده نمی‌شود
      await sendView(ctx, outcome.nextView, messageId);
      return;
    }
    if (outcome.kind === 'diagnostics_completed') {
      await sendText(ctx, diagnosticsCompletedText(outcome.matrix), { editMessageId: messageId });
      reportQueue.enqueue(session.id);
      return;
    }
  });

  bot.callbackQuery(CB.explain, async (ctx) => {
    const from = ctx.from;
    const session = flow.activeSession(from.id);
    if (!session) {
      await ctx.answerCallbackQuery({ text: 'پروندهٔ فعالی نیست.' });
      return;
    }
    const view = flow.beginExplanation(session);
    if (!view) {
      await ctx.answerCallbackQuery({ text: 'برای این پرسش امکان ثبت توضیح نیست.' });
      return;
    }
    await ctx.answerCallbackQuery({ text: 'متن توضیح را بفرستید' });
    const messageId = ctx.callbackQuery.message?.message_id;
    await sendView(ctx, view, messageId);
  });

  bot.callbackQuery(CB.explainSkip, async (ctx) => {
    const from = ctx.from;
    const session = flow.activeSession(from.id);
    if (!session) {
      await ctx.answerCallbackQuery({ text: 'پروندهٔ فعالی نیست.' });
      return;
    }
    const view = flow.cancelExplanation(session);
    await ctx.answerCallbackQuery();
    if (view) await sendView(ctx, view, ctx.callbackQuery.message?.message_id);
  });

  bot.callbackQuery(CB.back, async (ctx) => {
    const from = ctx.from;
    const session = flow.activeSession(from.id);
    if (!session) {
      await ctx.answerCallbackQuery({ text: 'پروندهٔ فعالی نیست.' });
      return;
    }
    const view = flow.previousView(session);
    if (!view) {
      await ctx.answerCallbackQuery({ text: 'پرسش قبلی وجود ندارد.' });
      return;
    }
    await ctx.answerCallbackQuery();
    await sendView(ctx, view, ctx.callbackQuery.message?.message_id);
  });

  bot.callbackQuery(CB.cancel, async (ctx) => {
    const from = ctx.from;
    const session = flow.activeSession(from.id);
    if (session) flow.cancelSession(session);
    await ctx.answerCallbackQuery({ text: 'لغو شد' });
    await ctx.editMessageText('✋ گفت‌وگو لغو شد. با /start دوباره شروع کنید.').catch(() => undefined);
  });

  bot.callbackQuery(CB.resume, async (ctx) => {
    const from = ctx.from;
    const session = flow.activeSession(from.id);
    await ctx.answerCallbackQuery();
    if (!session) {
      await ctx.reply('گفت‌وگوی ناتمامی نیست. با /start شروع کنید.');
      return;
    }
    if (session.status === 'consent_pending') {
      await ctx.editMessageText(consentText(flow.combinedTotal), { parse_mode: 'HTML', reply_markup: consentKeyboard() }).catch(() => undefined);
      return;
    }
    const view = flow.resumeView(session);
    if (!view) {
      await ctx.reply('ادامهٔ این پرونده ممکن نیست.');
      return;
    }
    await sendView(ctx, view);
  });

  bot.callbackQuery(CB.newSession, async (ctx) => {
    const from = ctx.from;
    await ctx.answerCallbackQuery();
    const active = flow.activeSession(from.id);
    if (active) flow.cancelSession(active);
    const session = flow.createSession(from.id);
    repo.logEvent({ type: 'session.new_while_unfinished', sessionId: session.id, telegramId: from.id });
    await sendText(ctx, consentText(flow.combinedTotal), { keyboard: consentKeyboard() });
  });

  // ------------------------------------------------------ متن آزاد کاربر
  bot.on('message:text', async (ctx) => {
    const from = ctx.from;
    const session = flow.activeSession(from.id);
    if (!session || (session.status !== 'screening_in_progress' && session.status !== 'diagnostics_in_progress')) {
      await ctx.reply('برای شروع گفت‌وگو /start را بزنید. راهنما: /help');
      return;
    }

    // حالت «منتظر توضیح»: متن کاربر به‌عنوان ساید دوم پرسش جاری ثبت می‌شود
    if (flow.isAwaitingExplanation(session.id) && session.status === 'diagnostics_in_progress') {
      const text = ctx.message.text.trim();
      if (!isPlausibleExplanation(text)) {
        await ctx.reply('توضیح خیلی کوتاه است؛ کمی بیشتر بنویسید یا دکمهٔ «بی‌خیال» را بزنید.');
        return;
      }
      const view = flow.submitExplanation(session, text);
      if (!view) {
        await ctx.reply('ثبت توضیح ممکن نشد؛ دوباره تلاش کنید.');
        return;
      }
      await ctx.reply(explanationSavedText(view.question.code));
      await sendView(ctx, view);
      return;
    }

    const parsed = parseTextAnswer(ctx.message.text);
    if (parsed === undefined) {
      repo.bumpBehavior(session.id, { invalidAttempts: 1 });
      await ctx.reply('برای پاسخ، یکی از دکمه‌های ۰ تا ۱۰ را بزنید یا خود عدد را بنویسید.');
      return;
    }
    const index = session.status === 'screening_in_progress' ? session.gate_cursor : session.matrix_cursor;
    const outcome = flow.submitAnswer(session, index, parsed);
    if (outcome.kind === 'advanced') {
      await sendView(ctx, outcome.view);
      return;
    }
    if (outcome.kind === 'screening_completed') {
      await sendView(ctx, outcome.nextView);
      return;
    }
    if (outcome.kind === 'diagnostics_completed') {
      await sendText(ctx, diagnosticsCompletedText(outcome.matrix));
      reportQueue.enqueue(session.id);
      return;
    }
    await ctx.reply('این پاسخ قابل ثبت نبود؛ لطفاً دوباره تلاش کنید.');
  });

  bot.catch((err) => {
    log.error('خطای پردازش به‌روزرسانی تلگرام', {
      error: err.error instanceof Error ? err.error.message : String(err.error),
      updateId: err.ctx.update.update_id,
    });
  });

  log.info('handlerهای ربات ثبت شدند', { combinedTotal: flow.combinedTotal });
}
