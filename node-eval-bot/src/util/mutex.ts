/**
 * قفل کلیدمحور (per-key mutex).
 *
 * چرا لازم است؟ به‌روزرسانی‌های تلگرام می‌توانند برای یک کاربر تقریباً هم‌زمان
 * برسند (دوبار کلیک، retry تلگرام، دو پیام پشت‌سرهم). بدون قفل، دو handler
 * می‌توانند هم‌زمان وضعیت گفت‌وگو را بخوانند/بنویسند و «پرش سؤال» یا پاسخ
 * گم‌شده رخ دهد. با قفل، پردازش هر کاربر سریالی می‌شود.
 */
export class KeyedMutex {
  private readonly chains = new Map<string, Promise<unknown>>();

  async run<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.chains.get(key) ?? Promise.resolve();
    const result = previous.then(fn, fn);
    const guard = result.then(
      () => undefined,
      () => undefined,
    );
    this.chains.set(key, guard);
    try {
      return await result;
    } finally {
      if (this.chains.get(key) === guard) this.chains.delete(key);
    }
  }
}

/** محدودکنندهٔ نرخ ساده با پنجرهٔ لغزان (در حافظه) */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(private readonly limitPerMinute: number) {}

  /** true اگر مجاز باشد */
  allow(key: string, now = Date.now()): boolean {
    const windowStart = now - 60_000;
    const list = (this.hits.get(key) ?? []).filter((t) => t > windowStart);
    if (list.length >= this.limitPerMinute) {
      this.hits.set(key, list);
      return false;
    }
    list.push(now);
    this.hits.set(key, list);
    if (this.hits.size > 5000) this.sweep(windowStart);
    return true;
  }

  private sweep(windowStart: number): void {
    for (const [key, list] of this.hits) {
      const kept = list.filter((t) => t > windowStart);
      if (kept.length === 0) this.hits.delete(key);
      else this.hits.set(key, kept);
    }
  }
}
