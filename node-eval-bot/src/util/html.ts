/**
 * ابزارهای ساخت HTML.
 *
 * ⚠️ نکتهٔ امنیتی: تمام متنی که از کاربر می‌آید (پاسخ‌ها، نام، ورودی متنی) و
 * تمام متنی که از مدل زبانی می‌آید، «نامعتمد» است. هر جای‌گذاری در HTML باید از
 * escapeHtml عبور کند، وگرنه گزارش به مسیر تزریق HTML/JS تبدیل می‌شود.
 */

export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** متن چندخطی → HTML با حفظ خطوط جدید */
export function escapeMultiline(input: unknown): string {
  return escapeHtml(input).replace(/\n/g, '<br>');
}

/** JSON داخل <script> — جلوگیری از بسته‌شدن تگ با </script> درون داده */
export function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
