/**
 * Provider سازگار با OpenAI — با هر سرویسی کار می‌کند که `/chat/completions` دارد:
 * OpenAI، OpenRouter، Ollama (`/v1`)، vLLM، LM Studio و…
 *
 * رفتار در شکست: هیچ خطایی به بیرون پرتاب نمی‌شود. اگر مدل پاسخ نداد یا خروجی
 * نامعتبر بود، «مفسر قطعی» جایگزین می‌شود و در خود گزارش ثبت می‌شود که تفسیر
 * مدل انجام نشده است. (اصل: شکست باید صادقانه در محصول دیده شود، نه پنهان.)
 */
import type { ActionsVocab, ContentBundle } from '../domain/content.js';
import type { Interpretation, MatrixBand } from '../domain/types.js';
import { deterministicInterpretation } from './deterministic.js';
import { renderInterpretPrompt } from './prompt.js';
import { InterpretationValidationError, coerceInterpretation, extractJsonObject } from './schema.js';
import type { InterpretInput, LlmProvider } from './types.js';

export interface OpenAiProviderOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
  content: ContentBundle;
  vocab: ActionsVocab;
  /** ارسال response_format=json_object (برخی سرویس‌ها پشتیبانی نمی‌کنند) */
  jsonMode?: boolean;
  onLog?: (level: 'info' | 'warn' | 'error', message: string, extra?: Record<string, unknown>) => void;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAiProvider implements LlmProvider {
  readonly name = 'openai';
  readonly model: string;
  private readonly o: OpenAiProviderOptions;

  constructor(options: OpenAiProviderOptions) {
    this.o = options;
    this.model = options.model;
  }

  private log(level: 'info' | 'warn' | 'error', message: string, extra?: Record<string, unknown>): void {
    this.o.onLog?.(level, message, extra);
  }

  private async callModel(messages: ChatMessage[], jsonMode: boolean): Promise<string> {
    const url = `${this.o.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.o.timeoutMs);
    try {
      const body: Record<string, unknown> = {
        model: this.o.model,
        messages,
        temperature: 0.2,
      };
      if (jsonMode) body['response_format'] = { type: 'json_object' };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.o.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
        (err as Error & { status?: number }).status = res.status;
        throw err;
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content;
      if (!content || content.trim() === '') throw new Error('پاسخ مدل خالی بود');
      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  private async callWithRetry(messages: ChatMessage[]): Promise<string> {
    let lastError: unknown;
    let jsonMode = this.o.jsonMode !== false;

    for (let attempt = 1; attempt <= Math.max(1, this.o.maxRetries); attempt += 1) {
      try {
        return await this.callModel(messages, jsonMode);
      } catch (err) {
        lastError = err;
        const status = (err as Error & { status?: number }).status;
        // اگر سرویس از حالت JSON پشتیبانی نمی‌کند، یک بار بدون آن تلاش کن.
        if (jsonMode && (status === 400 || status === 404 || status === 422)) {
          jsonMode = false;
          this.log('warn', 'حالت JSON پشتیبانی نشد؛ تلاش بدون response_format', { status });
          continue;
        }
        if (attempt < this.o.maxRetries) {
          const waitMs = 500 * 2 ** (attempt - 1);
          this.log('warn', 'تلاش مجدد تماس با مدل', { attempt, waitMs, error: String((err as Error).message) });
          await new Promise((r) => setTimeout(r, waitMs));
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  async interpret(input: InterpretInput): Promise<Interpretation> {
    const prompt = renderInterpretPrompt(input, this.o.content);
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'تو یک مفسر گزارش عارضه‌یابی کسب‌وکار هستی. خروجی تو صرفاً یک JSON معتبر مطابق طرح داده‌شده است. ' +
          'هیچ عدد جدیدی تولید نکن و حکم قطعی نده؛ فقط داده‌های محاسبه‌شده را تفسیر کن.',
      },
      { role: 'user', content: prompt },
    ];

    const expectedBand: MatrixBand = input.matrix.band;
    const fallbackStatement = `نمرهٔ عارضه‌یابی ${Math.round(input.matrix.overall0to100)} از ۱۰۰`;

    try {
      const text = await this.callWithRetry(messages);
      const parsed = extractJsonObject(text);
      return coerceInterpretation(parsed, {
        provider: this.name,
        model: this.model,
        now: input.now,
        expectedBand,
        fallbackStatement,
        tier: input.tier,
        awaitingHumanReview: input.awaitingHumanReview,
      });
    } catch (err) {
      const message =
        err instanceof InterpretationValidationError
          ? `خروجی مدل نامعتبر بود: ${err.message}`
          : `تماس با مدل ناموفق بود: ${(err as Error).message}`;
      this.log('error', 'تفسیر با مدل انجام نشد؛ استفاده از مفسر قطعی', { error: message });
      return deterministicInterpretation(
        input,
        { provider: this.name, model: this.model, status: 'fallback', error: message },
        this.o.vocab,
      );
    }
  }
}
