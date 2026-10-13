import type { ContentBundle } from '../domain/content.js';
import { INTERPRETATION_JSON_SCHEMA } from './schema.js';
import type { InterpretInput } from './types.js';

/** جای‌گذاری امن مقادیر در قالب پرامپت (بدون تفسیر متغیرهای $ در متن جایگزین) */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => values[key] ?? '');
}

export function renderInterpretPrompt(input: InterpretInput, content: ContentBundle): string {
  return fill(content.interpretPrompt, {
    MATRIX_JSON: JSON.stringify(input.bundle, null, 2),
    EXPLANATIONS_JSON: JSON.stringify(input.explanations, null, 2),
    MATRIX_VERSION: input.matrixVersion,
    TARGET_INDEX: String(input.targetIndex),
    SYMPTOM_THRESHOLD: String(input.symptomThreshold),
    NOW: input.now,
    OUTPUT_SCHEMA: JSON.stringify(INTERPRETATION_JSON_SCHEMA, null, 2),
  });
}

/** پرامپت مرحلهٔ دوم: تبدیل تحلیل به متن ویراستهٔ سند (دستورالعمل جداگانهٔ دیاگرام) */
export function renderDocumentPrompt(
  interpretationJson: string,
  content: ContentBundle,
): string {
  return fill(content.documentPrompt, {
    DOCUMENT_SCHEMA: JSON.stringify(DOCUMENT_SECTIONS_SCHEMA, null, 2),
    INTERPRETATION_JSON: interpretationJson,
  });
}

export const DOCUMENT_SECTIONS_SCHEMA = {
  executiveSummary: 'string — ۲ تا ۴ جمله',
  currentState: 'string — تصویر وضع موجود بر پایهٔ نمره‌ها و شکاف‌ها',
  keyFindings: ['string'],
  symptoms: [{ title: 'string', detail: 'string' }],
  roadmap: [{ title: 'string', why: 'string', ownerRole: 'string', horizon: 'string' }],
  needsConversation: ['string'],
  limitations: ['string'],
} as const;
