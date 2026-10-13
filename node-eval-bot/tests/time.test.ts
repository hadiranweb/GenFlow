import { describe, expect, it } from 'vitest';
import { formatJalaliDate, toJalali, toPersianDigits } from '../src/util/time.js';

describe('تبدیل تاریخ شمسی', () => {
  it('نوروز ۱۴۰۴ برابر ۱ فروردین است', () => {
    expect(toJalali(2025, 3, 21)).toEqual({ jy: 1404, jm: 1, jd: 1 });
  });

  it('نوروز ۱۴۰۵ برابر ۱ فروردین است', () => {
    expect(toJalali(2026, 3, 21)).toEqual({ jy: 1405, jm: 1, jd: 1 });
  });

  it('۱۱ اکتبر ۲۰۲۵ برابر ۱۹ مهر ۱۴۰۴ است', () => {
    expect(toJalali(2025, 10, 11)).toEqual({ jy: 1404, jm: 7, jd: 19 });
  });

  it('۱۱ اکتبر ۲۰۲۶ برابر ۱۹ مهر ۱۴۰۵ است', () => {
    expect(toJalali(2026, 10, 11)).toEqual({ jy: 1405, jm: 7, jd: 19 });
  });

  it('آخرین روز سال ۱۴۰۴ (۲۹ اسفند) درست تبدیل می‌شود', () => {
    // ۲۰ مارس ۲۰۲۶ = ۲۹ اسفند ۱۴۰۴
    expect(toJalali(2026, 3, 20)).toEqual({ jy: 1404, jm: 12, jd: 29 });
  });

  it('قالب‌بندی تاریخ با اعداد فارسی انجام می‌شود', () => {
    const out = formatJalaliDate(new Date('2026-10-11T09:00:00Z'), 'UTC');
    expect(out).toBe('۱۴۰۵/۰۷/۱۹');
  });

  it('تبدیل ارقام لاتین به فارسی', () => {
    expect(toPersianDigits(1234567890)).toBe('۱۲۳۴۵۶۷۸۹۰');
  });
});
