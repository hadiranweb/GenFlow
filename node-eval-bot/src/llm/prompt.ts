import type { ContentBundle } from '../domain/content.js';
import { INTERPRETATION_JSON_SCHEMA } from './schema.js';
import type { InterpretInput } from './types.js';

/** جای‌گذاری امن مقادیر در قالب پرامپت (بدون تفسیر متغیرهای $ در متن جایگزین) */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => values[key] ?? '');
}

/** برش فشردهٔ ماتریس تفسیر برای پرامپت: فقط زبان مرجع سند، بدون منابع/فرزندان کامل */
export function interpretationMatrixForPrompt(content: ContentBundle): unknown {
  const im = content.interpretationMatrix;
  return {
    version: im.version,
    layers: Object.fromEntries(
      Object.entries(im.layers).map(([code, l]) => [
        code,
        {
          title: l.title,
          as_is: l.as_is,
          to_be: l.to_be,
          recommended_actions: l.recommended_actions,
          keyword_parents: l.keyword_tree.map((k) => ({ id: k.id, title: k.title, questions: k.related_question_refs })),
        },
      ]),
    ),
    cross_layer_patterns: im.crossLayerPatterns.map((p) => ({ id: p.id, meaning: p.meaning, action_focus: p.action_focus })),
  };
}

export function renderInterpretPrompt(input: InterpretInput, content: ContentBundle): string {
  return fill(content.interpretPrompt, {
    MATRIX_JSON: JSON.stringify(input.bundle, null, 2),
    INTERPRETATION_MATRIX_JSON: JSON.stringify(interpretationMatrixForPrompt(content), null, 2),
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
