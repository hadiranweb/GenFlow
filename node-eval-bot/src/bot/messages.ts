/**
 * متن‌ها و کیبوردهای فارسی ربات — بازنویسی مطابق فرایند اصلی.
 *
 * اصل‌هایی که در متن‌ها رعایت شده:
 *  • لیبل ارزیابی اولیه هرگز به کاربر نمایش داده نمی‌شود (فقط در پرونده/سطح مدیریت).
 *  • گذار از ارزیابی به عارضه‌یابی اعلام نمی‌شود؛ شمارندهٔ پیشرفت پیوسته است.
 *  • صداقت: در رضایت‌نامه صریح گفته می‌شود که توضیحات متنی برای تفسیر به سرویس
 *    مدل زبانی ارسال می‌شوند و کاربر می‌تواند توضیح ننویسد.
 */
import { InlineKeyboard } from 'grammy';
import type { MatrixResult, QuestionnaireDef } from '../domain/types.js';
import { bandLabel } from '../domain/matrix.js';
import { toPersianDigits } from '../util/time.js';

export const CB = {
  consentYes: 'consent:yes',
  consentNo: 'consent:no',
  answer: (index: number, value: number | 'skip') => `a:${index}:${value}`,
  explain: 'explain:add',
  explainSkip: 'explain:skip',
  back: 'back',
  cancel: 'cancel',
  resume: 'resume',
  newSession: 'session:new',
} as const;

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function progressBar(done: number, total: number): string {
  const cells = 10;
  const filled = total === 0 ? 0 : Math.round((done / total) * cells);
  return '▰'.repeat(filled) + '▱'.repeat(cells - filled);
}

export function consentText(totalQuestions: number): string {
  return [
    '👋 <b>خوش آمدید</b>',
    '',
    'این ابزار، «نود ارزیابی» است: یک مسیر پیوسته برای شناخت اولیه و سپس عارضه‌یابی نود شما.',
    '',
    `🧭 <b>${toPersianDigits(totalQuestions)} پرسش</b> پیش روی شماست؛ هر پرسش یک عدد بین ۰ تا ۱۰ است` +
      ' که با دکمه‌های پیام انتخاب می‌شود.',
    '• هر پاسخ <b>بلافاصله ذخیره</b> می‌شود؛ اگر گفت‌وگو را نیمه‌کاره رها کنید، با /resume ادامه می‌دهید.',
    '• در بخش دوم می‌توانید برای هر پرسش، در صورت تمایل، <b>توضیح کوتاهی</b> هم بنویسید (اختیاری).',
    '• در پایان، یک <b>سند عارضه‌یابی</b> قابل دانلود دریافت می‌کنید.',
    '',
    '🔒 <b>حریم خصوصی و شفافیت</b>',
    '• پاسخ‌های شما فقط برای همین ارزیابی استفاده می‌شود و با /delete کاملاً حذف می‌شود.',
    '• از پاسخ‌های بخش اول، یک <b>برچسب داخلی</b> محاسبه و در پروندهٔ شما ذخیره می‌شود. این برچسب',
    '  برای شما نمایش داده نمی‌شود، در روند گفت‌وگو و تحلیل اثر ندارد، و فقط برای سنجش و',
    '  گزارش‌گیری داخلی نگه داشته می‌شود.',
    '• <b>توضیحات متنی</b> که در بخش دوم می‌نویسید، همراه با نمره‌ها برای «تفسیر» به سرویس مدل',
    '  زبانی ارسال می‌شود. اگر نمی‌خواهید متنی ارسال شود، کافی است توضیحی ننویسید؛ ادامهٔ فرایند',
    '  بدون آن هم کامل است.',
    '• این خروجی کمک‌تصمیم است و جایگزین ارزیابی تخصصی انسانی نیست.',
    '',
    'آماده‌اید شروع کنیم؟',
  ].join('\n');
}

export function consentKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('✅ موافقم، شروع کن', CB.consentYes).row().text('❌ فعلاً نه', CB.consentNo);
}

export function consentDeclinedText(): string {
  return 'باشه. هر وقت خواستید با /start دوباره شروع کنید. 🙏';
}

/** پیام انتخاب ادامه/شروع نو وقتی نشست ناتمام وجود دارد */
export function unfinishedSessionText(sessionNo: number, answered: number, total: number): string {
  return [
    `📌 یک گفت‌وگوی ناتمام دارید (نشست شمارهٔ ${toPersianDigits(sessionNo)}) —`,
    `تا اینجا ${toPersianDigits(answered)} از ${toPersianDigits(total)} پرسش پاسخ داده شده است.`,
    '',
    'می‌توانید همان را ادامه دهید، یا گفت‌وگوی جدیدی شروع کنید.',
    '<i>در صورت شروع نو، پاسخ‌های نشست قبلی در پروندهٔ شما باقی می‌ماند.</i>',
  ].join('\n');
}

export function unfinishedSessionKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('▶️ ادامهٔ گفت‌وگو', CB.resume).row().text('🆕 شروع گفت‌وگوی جدید', CB.newSession);
}

/**
 * نمایش یک پرسش. پیشرفت، پیوسته است (۱..total) تا گذارِ دو بخش اعلام نشود.
 */
export function renderQuestion(
  questionnaire: QuestionnaireDef,
  index: number,
  total: number,
  offset: number,
  opts: { intro?: boolean; awaitingExplanation?: boolean; explanationAllowed?: boolean } = {},
): { text: string; keyboard: InlineKeyboard } {
  const questions = questionnaire.sections.flatMap((s) => s.questions);
  const question = questions[index];
  if (!question) throw new Error(`پرسش با شمارهٔ ${index} وجود ندارد`);
  const section = questionnaire.sections.find((s) => s.code === question.dimension);
  const displayNumber = offset + index + 1;
  const isDiagnostics = question.response === 'range+text';

  const lines: string[] = [];
  lines.push('🧭 <b>ارزیابی نود</b>');
  lines.push(
    `${progressBar(displayNumber - 1, total)}  ${toPersianDigits(Math.round(((displayNumber - 1) / total) * 100))}٪ — پرسش ${toPersianDigits(displayNumber)} از ${toPersianDigits(total)}`,
  );
  if (opts.intro && questionnaire.intro) {
    lines.push('');
    lines.push(`<i>${questionnaire.intro}</i>`);
  }
  lines.push('');
  lines.push(`<b>${question.text}</b>`);
  if (question.low || question.high) {
    lines.push('');
    lines.push(`۰ ← ${question.low ?? 'کمترین'}`);
    lines.push(`۱۰ ← ${question.high ?? 'بیشترین'}`);
  }
  if (section) {
    lines.push('');
    lines.push(`<i>محور: ${section.title}</i>`);
  }
  if (opts.awaitingExplanation) {
    lines.push('');
    lines.push('📝 <b>منتظر توضیح شما هستم.</b> متن توضیح را بفرستید، یا «بی‌خیال» را بزنید.');
  } else if (isDiagnostics && opts.explanationAllowed !== false) {
    lines.push('');
    lines.push('<i>اگر خواستید برای این پرسش توضیحی بدهید، دکمهٔ «📝 توضیح» را بزنید (اختیاری).</i>');
  }

  const kb = new InlineKeyboard();
  if (opts.awaitingExplanation) {
    kb.text('↩️ بی‌خیال، برو به پاسخ', CB.explainSkip);
  } else {
    for (let v = 0; v <= 5; v += 1) kb.text(FA_DIGITS[v]!, CB.answer(index, v));
    kb.row();
    for (let v = 6; v <= 10; v += 1) kb.text(FA_DIGITS[v]!, CB.answer(index, v));
    kb.row().text('🤷 نمی‌دانم', CB.answer(index, 'skip'));
    if (isDiagnostics && opts.explanationAllowed !== false) kb.text('📝 توضیح', CB.explain);
    if (index > 0) kb.text('↩️ قبلی', CB.back);
    kb.text('✋ لغو', CB.cancel);
  }
  return { text: lines.join('\n'), keyboard: kb };
}

export function explanationSavedText(questionCode: string): string {
  return `✅ توضیح شما برای پرسش <code>${questionCode}</code> ثبت شد. حالا عدد این پرسش را انتخاب کنید.`;
}

/** پیام پایان عارضه‌یابی (قبل از شروع ساخت سند) */
export function diagnosticsCompletedText(matrix: MatrixResult): string {
  const criticals = matrix.symptoms.filter((s) => s.critical).length;
  return [
    '✅ <b>پاسخ‌های شما ثبت شد</b>',
    '',
    `نمرهٔ کل عارضه‌یابی: <b>${toPersianDigits(Math.round(matrix.overall0to100))}</b> از ۱۰۰ — ${bandLabel(matrix.band)}`,
    `گلوگاه اصلی: ${matrix.bottleneck.title} (${toPersianDigits(Math.round(matrix.bottleneck.score0to100))})`,
    `عارضه‌های مشاهده‌شده: ${toPersianDigits(matrix.symptoms.length)}` +
      (criticals > 0 ? ` — از این میان ${toPersianDigits(criticals)} مورد کلیدی` : ''),
    matrix.explanationsCount > 0
      ? `توضیحات ثبت‌شده: ${toPersianDigits(matrix.explanationsCount)}`
      : 'توضیح تکمیلی ثبت نشده است (اختیاری بود).',
    '',
    '⏳ در حال آماده‌سازی سند عارضه‌یابی…',
    'این کار معمولاً کمتر از یک دقیقه طول می‌کشد.',
  ].join('\n');
}

export function reportCaption(input: {
  sessionNo: number;
  bandLabel: string;
  score: number;
  explanationsCount: number;
  publicUrl?: string | undefined;
  tier: string;
  awaitingHumanReview: boolean;
}): string {
  const lines = [
    '📄 <b>سند عارضه‌یابی شما آماده است</b>',
    '',
    `نشست شمارهٔ ${toPersianDigits(input.sessionNo)} · وضعیت کلی: <b>${input.bandLabel}</b> (${toPersianDigits(Math.round(input.score))} از ۱۰۰)`,
    input.explanationsCount > 0
      ? `توضیحات شما در تفسیر لحاظ شده است (${toPersianDigits(input.explanationsCount)} مورد).`
      : 'این سند بر پایهٔ پاسخ‌های رنجی تهیه شده است.',
    '',
    'فایل HTML را دانلود کنید و در مرورگر باز کنید (تک‌فایلی است و به اینترنت نیازی ندارد).',
  ];
  if (input.tier === 'deep_ai') {
    lines.push('', 'ℹ️ این تفسیر با مدل زبانی تهیه شده است.');
    if (input.awaitingHumanReview) {
      lines.push('📌 این سند «پیش‌نویس» است و پیش از تصمیم نهایی باید بازبینی انسانی شود.');
    }
  }
  if (input.publicUrl) lines.push('', `🌐 نسخهٔ آنلاین: ${input.publicUrl}`);
  return lines.join('\n');
}

export function helpText(): string {
  return [
    '<b>راهنما</b>',
    '',
    '/start — شروع گفت‌وگوی جدید',
    '/resume — ادامهٔ آخرین گفت‌وگوی ناتمام',
    '/report — دریافت مجدد آخرین سند',
    '/status — وضعیت پروندهٔ فعلی',
    '/about — این ابزار چه می‌کند و چه نمی‌کند',
    '/delete — حذف کامل داده‌های من',
    '/cancel — لغو گفت‌وگوی جاری',
    '',
    'هر پرسش را با یکی از دکمه‌های ۰ تا ۱۰ پاسخ می‌دهید؛ می‌توانید عدد را هم بنویسید.',
  ].join('\n');
}

export function aboutText(): string {
  return [
    '<b>دربارهٔ این ابزار</b>',
    '',
    'این «نود ارزیابی» یک گذرگاه تصمیم است، نه جایگزین ارزیاب انسانی:',
    '• <b>نمره‌دهی</b> کاملاً با فرمول ثابت و نسخه‌دار انجام می‌شود؛ مدل زبانی در محاسبه دخالتی ندارد.',
    '• <b>ارزیابی اولیه</b> نتیجه‌اش یک برچسب داخلی است که به شما نمایش داده نمی‌شود و در روند',
    '  گفت‌وگو و تحلیل اثر ندارد.',
    '• <b>عارضه‌یابی</b> دو ساید دارد: پاسخ رنجی (وارد محاسبه) و توضیح متنی (اختیاری، فقط برای تفسیر).',
    '• <b>مدل زبانی</b> فقط در مرحلهٔ تفسیر استفاده می‌شود؛ اعداد از فرمول می‌آیند.',
    '• اگر «تفسیر عمیق» فعال نباشد، تفسیر به‌صورت داخلی و قاعده‌محور انجام می‌شود.',
    '',
    'این خروجی کمک‌تصمیم است و جایگزین ارزیابی تخصصی انسانی نیست.',
  ].join('\n');
}

/** تفسیر متن آزاد به‌عنوان پاسخ عددی */
export function parseTextAnswer(text: string): number | null | undefined {
  const normalized = normalizeDigits(text.trim());
  if (/^(?:نمی‌دانم|نمی دانم|نمیدانم|unknown|\?)$/i.test(normalized)) return null;
  if (!/^\d{1,2}$/.test(normalized)) return undefined;
  const value = Number(normalized);
  if (value < 0 || value > 10) return undefined;
  return value;
}

function normalizeDigits(text: string): string {
  return text
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/** آستانهٔ طول متن توضیح (برای اعتبارسنجی در لایهٔ ربات) */
export function isPlausibleExplanation(text: string): boolean {
  const t = text.trim();
  return t.length >= 3;
}
