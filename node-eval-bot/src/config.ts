import 'dotenv/config';
import path from 'node:path';

export type BotMode = 'polling' | 'webhook' | 'disabled';
export type LlmProviderName = 'mock' | 'openai';


export interface AppConfig {
  botToken: string;
  botMode: BotMode;
  publicBaseUrl: string;
  webhookSecret: string;
  webhookPath: string;
  httpPort: number;
  reportLinkSecret: string;
  dataDir: string;
  databasePath: string;
  reportsDir: string;
  llm: {
    provider: LlmProviderName;
    baseUrl: string;
    apiKey: string;
    model: string;
    timeoutMs: number;
    maxRetries: number;
  };
  /** اطلاع‌رسانی به مدیر وقتی لیبل قرمز صادر شد (پیش‌فرض: خاموش) */
  notifyAdminOnRedLabel: boolean;
  adminChatId: number | null;
  answerTimeoutSeconds: number;
  rateLimitPerMinute: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

function req(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(
      `متغیر محیطی ${name} تنظیم نشده است. فایل .env را از .env.example بسازید.`,
    );
  }
  return v.trim();
}

function opt(name: string, fallback: string): string {
  const v = process.env[name];
  return v === undefined || v.trim() === '' ? fallback : v.trim();
}

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error(`متغیر ${name} باید عدد باشد`);
  return n;
}

export function loadConfig(): AppConfig {
  const dataDir = path.resolve(opt('DATA_DIR', './data'));
  const reportsDir = path.resolve(opt('REPORTS_DIR', path.join(dataDir, 'reports')));
  const databasePath = path.resolve(opt('DATABASE_PATH', path.join(dataDir, 'app.db')));

  const botMode = opt('BOT_MODE', 'polling') as BotMode;
  if (botMode !== 'polling' && botMode !== 'webhook' && botMode !== 'disabled') {
    throw new Error('BOT_MODE باید polling، webhook یا disabled باشد');
  }

  const provider = opt('LLM_PROVIDER', 'mock') as LlmProviderName;
  if (provider !== 'mock' && provider !== 'openai') {
    throw new Error('LLM_PROVIDER باید mock یا openai باشد');
  }

  const adminChatRaw = opt('ADMIN_CHAT_ID', '');
  const adminChatId = adminChatRaw === '' ? null : Number(adminChatRaw);
  if (adminChatRaw !== '' && !Number.isFinite(adminChatId)) {
    throw new Error('ADMIN_CHAT_ID باید عدد (شناسهٔ عددی چت) باشد');
  }

  const cfg: AppConfig = {
    // در حالت disabled (فقط HTTP: سلامت + دانلود گزارش) توکن لازم نیست
    botToken: botMode === 'disabled' ? opt('BOT_TOKEN', 'disabled:mode') : req('BOT_TOKEN'),
    botMode,
    publicBaseUrl: opt('PUBLIC_BASE_URL', ''),
    webhookSecret: opt('WEBHOOK_SECRET', ''),
    webhookPath: opt('WEBHOOK_PATH', '/webhook/telegram'),
    httpPort: num('HTTP_PORT', 8080),
    reportLinkSecret: opt('REPORT_LINK_SECRET', 'insecure-dev-secret'),
    dataDir,
    databasePath,
    reportsDir,
    llm: {
      provider,
      baseUrl: opt('LLM_BASE_URL', 'https://api.openai.com/v1'),
      apiKey: opt('LLM_API_KEY', ''),
      model: opt('LLM_MODEL', 'gpt-4o-mini'),
      timeoutMs: num('LLM_TIMEOUT_MS', 60000),
      maxRetries: num('LLM_MAX_RETRIES', 2),
    },
    notifyAdminOnRedLabel: opt('NOTIFY_ADMIN_ON_RED_LABEL', 'false') === 'true',
    adminChatId,
    answerTimeoutSeconds: num('ANSWER_TIMEOUT_SECONDS', 1800),
    rateLimitPerMinute: num('RATE_LIMIT_PER_MINUTE', 40),
    logLevel: opt('LOG_LEVEL', 'info') as AppConfig['logLevel'],
  };

  if (cfg.botMode === 'webhook') {
    if (!cfg.publicBaseUrl) throw new Error('در حالت webhook، PUBLIC_BASE_URL الزامی است');
    if (!cfg.webhookSecret) throw new Error('در حالت webhook، WEBHOOK_SECRET الزامی است');
  }
  if (cfg.llm.provider === 'openai' && !cfg.llm.apiKey) {
    throw new Error('برای LLM_PROVIDER=openai، مقدار LLM_API_KEY الزامی است');
  }
  if (cfg.reportLinkSecret === 'insecure-dev-secret' && process.env.NODE_ENV === 'production') {
    throw new Error('در production مقدار REPORT_LINK_SECRET را تنظیم کنید');
  }

  return cfg;
}
