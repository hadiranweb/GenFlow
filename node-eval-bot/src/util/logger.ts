/**
 * لاگر ساده و ساخت‌یافته (JSON line) — بدون وابستگی بیرونی.
 *
 * قاعدهٔ حریم خصوصی: محتوای پاسخ‌های کاربر هرگز لاگ نمی‌شود؛ فقط شناسه‌ها،
 * کد سؤال و شمارنده‌ها. (پاسخ‌ها دادهٔ حساس‌اند و فقط در DB می‌مانند.)
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface Logger {
  debug(message: string, extra?: Record<string, unknown>): void;
  info(message: string, extra?: Record<string, unknown>): void;
  warn(message: string, extra?: Record<string, unknown>): void;
  error(message: string, extra?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

export function createLogger(level: LogLevel, bindings: Record<string, unknown> = {}): Logger {
  const threshold = ORDER[level] ?? ORDER.info;

  const emit = (lvl: LogLevel, message: string, extra?: Record<string, unknown>): void => {
    if (ORDER[lvl] < threshold) return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level: lvl,
      msg: message,
      ...bindings,
      ...(extra ?? {}),
    });
    if (lvl === 'error') process.stderr.write(line + '\n');
    else process.stdout.write(line + '\n');
  };

  return {
    debug: (m, e) => emit('debug', m, e),
    info: (m, e) => emit('info', m, e),
    warn: (m, e) => emit('warn', m, e),
    error: (m, e) => emit('error', m, e),
    child: (extraBindings) => createLogger(level, { ...bindings, ...extraBindings }),
  };
}
