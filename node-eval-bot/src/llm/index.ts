import type { AppConfig } from '../config.js';
import type { ContentBundle } from '../domain/content.js';
import { MockLlmProvider } from './mock.js';
import { OpenAiProvider } from './openai.js';
import type { LlmProvider } from './types.js';

export type { LlmProvider, InterpretInput } from './types.js';

export function createLlmProvider(
  config: AppConfig,
  content: ContentBundle,
  onLog?: (level: 'info' | 'warn' | 'error', message: string, extra?: Record<string, unknown>) => void,
): LlmProvider {
  if (config.llm.provider === 'openai') {
    return new OpenAiProvider({
      baseUrl: config.llm.baseUrl,
      apiKey: config.llm.apiKey,
      model: config.llm.model,
      timeoutMs: config.llm.timeoutMs,
      maxRetries: config.llm.maxRetries,
      content,
      vocab: content.actions,
      ...(onLog ? { onLog } : {}),
    });
  }
  return new MockLlmProvider(content.actions);
}
