import type { ExplanationPayloadItem, Interpretation, MatrixResult } from '../domain/types.js';
import type { MatrixBundle } from '../domain/matrix.js';
import type { InterpretationMatrix } from '../domain/content.js';

export interface InterpretInput {
  matrix: MatrixResult;
  bundle: MatrixBundle;
  /** «ماتریس تفسیر پنج‌لایه» — زبان مرجع تفسیر (وضع موجود/مطلوب/اقدام هر لایه) */
  interpretationMatrix?: InterpretationMatrix;
  /** توضیحات متنی کاربر (ساید دوم) — در مسیر رنجی خالی است */
  explanations: ExplanationPayloadItem[];
  matrixVersion: string;
  targetIndex: number;
  symptomThreshold: number;
  now: string;
  /** range_only = تفسیر داخلی · deep_ai = پیش‌نویس مفسر عمیق با مدل */
  tier: 'range_only' | 'deep_ai';
  /** در مسیر عمیق، سند پیش از بازبینی انسانی است */
  awaitingHumanReview: boolean;
}

export interface LlmProvider {
  readonly name: string;
  readonly model: string;
  /** در هیچ حالتی خطا throw نمی‌کند؛ در شکست، تفسیر قطعی برمی‌گرداند. */
  interpret(input: InterpretInput): Promise<Interpretation>;
}
