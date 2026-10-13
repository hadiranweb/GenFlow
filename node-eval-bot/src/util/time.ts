/**
 * تبدیل و قالب‌بندی تاریخ شمسی — پیاده‌سازی مستقل و بدون وابستگی.
 * الگوریتم استاندارد جلالی (Khayyam/Birashk-based) که با تقویم رسمی ایران
 * برای بازهٔ ۱۱۷۸ تا ۱۶۳۳ شمسی مطابقت دارد.
 */

function div(a: number, b: number): number {
  return Math.floor(a / b);
}

/** gregorian → jalali */
export function toJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) +
    gd +
    (g_d_m[gm - 1] ?? 0);
  let jy = -1595 + 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

const MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/** قالب خوانا: «۱۹ مهر ۱۴۰۵ — ساعت ۱۴:۳۰» */
export function formatJalaliDateTime(date: Date, timeZone = 'Asia/Tehran'): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
  const { jy, jm, jd } = toJalali(get('year'), get('month'), get('day'));
  const hh = String(get('hour')).padStart(2, '0');
  const mm = String(get('minute')).padStart(2, '0');
  return `${toPersianDigits(jd)} ${MONTHS[jm - 1] ?? ''} ${toPersianDigits(jy)} — ساعت ${toPersianDigits(hh)}:${toPersianDigits(mm)}`;
}

/** فقط تاریخ شمسی: ۱۴۰۵/۰۷/۱۹ */
export function formatJalaliDate(date: Date, timeZone = 'Asia/Tehran'): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
  const { jy, jm, jd } = toJalali(get('year'), get('month'), get('day'));
  return toPersianDigits(`${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`);
}

export function nowIso(): string {
  return new Date().toISOString();
}
