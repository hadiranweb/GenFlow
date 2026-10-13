/**
 * سرور HTTP:
 *   GET  /health                    → سلامت سرویس (DB، LLM، اندازهٔ صف)
 *   GET  /reports/:id?t=<token>     → دانلود فایل گزارش HTML (با توکن امضاشده)
 *   POST /webhook/telegram          → فقط در حالت webhook
 *
 * نکته: در حالت polling، پورت HTTP فقط برای سلامت و دانلود گزارش استفاده می‌شود
 * و نیازی به دامنهٔ عمومی ندارد.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { webhookCallback, type Bot } from 'grammy';
import type { AppConfig } from '../config.js';
import type { Logger } from '../util/logger.js';
import type { Repo } from '../storage/repo.js';
import type { ReportQueue } from '../jobs/reportJob.js';
import { verifyReportToken } from '../util/sign.js';

export interface HttpDeps {
  config: AppConfig;
  logger: Logger;
  repo: Repo;
  bot: Bot;
  reportQueue: ReportQueue;
  startedAt: number;
}

function json(res: ServerResponse, code: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(payload);
}

async function readBody(req: IncomingMessage, limitBytes = 1_000_000): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export function createHttpServer(deps: HttpDeps): Server {
  const { config, logger, repo, bot, reportQueue, startedAt } = deps;
  const log = logger.child({ component: 'http' });
  const webhookHandler = webhookCallback(bot, 'http', {
    secretToken: config.botMode === 'webhook' ? config.webhookSecret : undefined,
  });

  return createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${config.httpPort}`);
    const pathname = url.pathname;

    try {
      // ------------------------------------------------------------- health
      if (req.method === 'GET' && pathname === '/health') {
        let dbOk = true;
        try {
          repo.countEvents('health.probe');
        } catch {
          dbOk = false;
        }
        const status = dbOk ? 'ok' : 'degraded';
        json(res, dbOk ? 200 : 503, {
          status,
          uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
          mode: config.botMode,
          llm: { provider: config.llm.provider, model: config.llm.provider === 'mock' ? 'deterministic-mock-v1' : config.llm.model },
          reportQueueSize: reportQueue.size,
          db: dbOk ? 'ok' : 'unavailable',
          version: '0.1.0',
        });
        return;
      }

      // -------------------------------------------------------- دانلود گزارش
      const reportMatch = /^\/reports\/([0-9a-f-]{36})$/.exec(pathname);
      if (req.method === 'GET' && reportMatch) {
        const reportId = reportMatch[1]!;
        const token = url.searchParams.get('t') ?? '';
        const tokenOk = token !== '' && verifyReportToken(reportId, token, config.reportLinkSecret);
        const isDevRelaxed = process.env.NODE_ENV !== 'production' && token === '';

        if (!tokenOk && !isDevRelaxed) {
          json(res, 403, { error: 'لینک نامعتبر یا منقضی است' });
          return;
        }
        const report = repo.getReport(reportId);
        if (!report || report.status !== 'ready' || !report.html_path) {
          json(res, 404, { error: 'گزارش یافت نشد یا آماده نیست' });
          return;
        }
        const html = readFileSync(report.html_path, 'utf8');
        res.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'private, max-age=0, no-store',
          'x-robots-tag': 'noindex, nofollow',
          'content-size': statSync(report.html_path).size,
        });
        res.end(html);
        return;
      }

      // --------------------------------------------------------- webhook تلگرام
      if (config.botMode === 'webhook' && req.method === 'POST' && pathname === config.webhookPath) {
        const body = await readBody(req);
        // grammy انتظار یک Request استاندارد دارد؛ برای سرور خام، بدنه را دستی به آن می‌دهیم.
        const fakeReq = new Request(`http://localhost${pathname}`, {
          method: 'POST',
          headers: {
            'content-type': req.headers['content-type'] ?? 'application/json',
            'x-telegram-bot-api-secret-token': String(req.headers['x-telegram-bot-api-secret-token'] ?? ''),
          },
          body,
        });
        const response = await (webhookHandler as unknown as (r: Request) => Promise<Response>)(fakeReq);
        res.writeHead(response.status, { 'content-type': response.headers.get('content-type') ?? 'text/plain' });
        res.end(await response.text());
        return;
      }

      if (req.method === 'GET' && pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(
          `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>نود ارزیابی</title>` +
            `<body style="font-family:Tahoma,system-ui;padding:32px;line-height:1.9">` +
            `<h1>نود ارزیابی — سرویس فعال است</h1>` +
            `<p>این سرور، ربات تلگرام «نود ارزیابی» را اجرا می‌کند.</p>` +
            `<ul><li>سلامت سرویس: <code>/health</code></li>` +
            `<li>دانلود گزارش: <code>/reports/&lt;id&gt;?t=&lt;token&gt;</code></li></ul>` +
            `</body></html>`,
        );
        return;
      }

      json(res, 404, { error: 'not found' });
    } catch (err) {
      log.error('خطا در پردازش درخواست HTTP', { path: pathname, error: (err as Error).message });
      if (!res.headersSent) json(res, 500, { error: 'internal error' });
      else res.end();
    }
  });
}
