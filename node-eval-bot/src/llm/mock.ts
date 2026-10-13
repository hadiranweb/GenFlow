/**
 * Provider حالت Mock — بدون هیچ تماس شبکه‌ای.
 * برای توسعه، تست و نمایش کامل جریان کار به کاربر، بدون نیاز به کلید API.
 */
import type { ActionsVocab } from '../domain/content.js';
import type { Interpretation } from '../domain/types.js';
import { deterministicInterpretation } from './deterministic.js';
import type { InterpretInput, LlmProvider } from './types.js';

export class MockLlmProvider implements LlmProvider {
  readonly name = 'mock';
  readonly model: string;
  private readonly vocab: ActionsVocab;

  constructor(vocab: ActionsVocab, model = 'deterministic-mock-v1') {
    this.vocab = vocab;
    this.model = model;
  }

  async interpret(input: InterpretInput): Promise<Interpretation> {
    return deterministicInterpretation(input, { provider: this.name, model: this.model, status: 'ok' }, this.vocab);
  }
}
