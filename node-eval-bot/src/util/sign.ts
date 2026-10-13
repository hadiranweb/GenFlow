import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * امضای لینک گزارش (HMAC-SHA256) تا لینک دانلود بدون توکن، قابل حدس و استفاده نباشد.
 * لینک منقضی نمی‌شود اما قابل ابطال است (با تغییر secret در محیط).
 */
export function signReportToken(reportId: string, secret: string, ttlSeconds = 60 * 60 * 24 * 14): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${reportId}.${exp}`;
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${exp}.${sig}`;
}

export function verifyReportToken(reportId: string, token: string, secret: string): boolean {
  const [expRaw, sig] = token.split('.');
  if (!expRaw || !sig) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const expected = createHmac('sha256', secret).update(`${reportId}.${exp}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
