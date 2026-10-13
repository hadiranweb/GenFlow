/**
 * طرح خروجی مفسر (برای پرامپت) + اعتبارسنجی خروجی مدل.
 *
 * اعتبارسنجی «نرم» است: خروجی مدل غیرقابل‌اعتماد است، پس هر میدان اشتباه یا
 * ناقص با پیش‌فرض امن پر می‌شود و در `meta` علامت می‌خورد؛ اما اگر ساختار
 * اصلی (headline/verdict) نباشد، شکست اعلام می‌شود تا fallback قطعی جایگزین شود.
 */
import type { Confidence, Interpretation, MatrixBand } from '../domain/types.js';

export const INTERPRETATION_JSON_SCHEMA = {
  headline: 'string — یک جملهٔ جمع‌بندی، بدون عدد جدید',
  verdict: {
    band: 'healthy | borderline | needs_fix | critical — همان دستهٔ محاسبه‌شده؛ تغییرش نده',
    statement: 'string — توضیح وضعیت در ۲ تا ۴ جمله',
    confidence: 'high | medium | low',
    needsConversation: 'boolean — اگر داده ناقص/ناسازگار است true',
  },
  narrative: ['string — ۳ تا ۶ پاراگراف تحلیل، هر پاراگراف یک ایده'],
  strengths: [{ title: 'string', evidence: 'string (ارجاع به کد سؤال یا نمرهٔ دامنه)', implication: 'string' }],
  risks: [
    {
      title: 'string',
      severity: 'low | medium | high',
      evidence: 'string',
      implication: 'string',
      mitigation: 'string',
    },
  ],
  bottlenecks: [
    { domainCode: 'string', domainTitle: 'string', score0to100: 'number (همان عدد داده، نه عدد جدید)', why: 'string' },
  ],
  inconsistencies: ['string — هر جا توضیح کاربر با نمرهٔ رنجی ناسازگار است'],
  openQuestions: ['string — پرسش‌هایی که فقط با گفت‌وگو پاسخ می‌گیرند'],
  nextActions: [
    { title: 'string', why: 'string', ownerRole: 'string', horizon: 'کوتاه‌مدت | میان‌مدت | بلندمدت' },
  ],
  limitations: ['string — محدودیت‌های این تحلیل'],
} as const;

const BANDS: MatrixBand[] = ['healthy', 'borderline', 'needs_fix', 'critical'];
const CONFIDENCES: Confidence[] = ['high', 'medium', 'low'];
const HORIZONS = ['کوتاه‌مدت', 'میان‌مدت', 'بلندمدت'] as const;

export class InterpretationValidationError extends Error {}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : fallback;
}

function strArray(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => str(x))
    .filter((x) => x !== '')
    .slice(0, max);
}

/**
 * خروجی خام مدل (شیء JSON) را به Interpretation معتبر تبدیل می‌کند.
 * @throws InterpretationValidationError اگر ساختار پایه وجود نداشته باشد.
 */
export function coerceInterpretation(
  raw: unknown,
  ctx: {
    provider: string;
    model: string;
    now: string;
    expectedBand: MatrixBand;
    fallbackStatement: string;
    tier: 'range_only' | 'deep_ai';
    awaitingHumanReview: boolean;
  },
): Interpretation {
  if (!raw || typeof raw !== 'object') {
    throw new InterpretationValidationError('خروجی مدل JSON معتبر نبود');
  }
  const obj = raw as Record<string, unknown>;
  const verdictRaw = (obj['verdict'] ?? {}) as Record<string, unknown>;

  const headline = str(obj['headline']);
  const statement = str(verdictRaw['statement']);
  if (!headline && !statement) {
    throw new InterpretationValidationError('خروجی مدل نه headline داشت و نه verdict.statement');
  }

  const bandRaw = String(verdictRaw['band'] ?? verdictRaw['zone'] ?? '');
  // دسته‌بندی را مدل تعیین نمی‌کند؛ اگر مقدار متفاوتی داد، مقدار محاسبه‌شده غالب است.
  const band: MatrixBand = BANDS.includes(bandRaw as MatrixBand) ? (bandRaw as MatrixBand) : ctx.expectedBand;

  const confRaw = String(verdictRaw['confidence'] ?? '');
  const confidence: Confidence = CONFIDENCES.includes(confRaw as Confidence) ? (confRaw as Confidence) : 'low';

  const strengths = Array.isArray(obj['strengths'])
    ? (obj['strengths'] as unknown[])
        .map((s) => {
          const o = (s ?? {}) as Record<string, unknown>;
          return { title: str(o['title']), evidence: str(o['evidence']), implication: str(o['implication']) };
        })
        .filter((s) => s.title !== '')
        .slice(0, 6)
    : [];

  const risks = Array.isArray(obj['risks'])
    ? (obj['risks'] as unknown[])
        .map((s) => {
          const o = (s ?? {}) as Record<string, unknown>;
          const sev = String(o['severity'] ?? 'medium');
          return {
            title: str(o['title']),
            severity: (['low', 'medium', 'high'].includes(sev) ? sev : 'medium') as 'low' | 'medium' | 'high',
            evidence: str(o['evidence']),
            implication: str(o['implication']),
            mitigation: str(o['mitigation']),
          };
        })
        .filter((s) => s.title !== '')
        .slice(0, 8)
    : [];

  const bottlenecks = Array.isArray(obj['bottlenecks'])
    ? (obj['bottlenecks'] as unknown[])
        .map((s) => {
          const o = (s ?? {}) as Record<string, unknown>;
          return {
            domainCode: str(o['domainCode']),
            domainTitle: str(o['domainTitle']),
            score0to100: Number.isFinite(Number(o['score0to100'])) ? Number(o['score0to100']) : 0,
            why: str(o['why']),
          };
        })
        .filter((b) => b.domainTitle !== '' || b.domainCode !== '')
        .slice(0, 5)
    : [];

  const nextActions = Array.isArray(obj['nextActions'])
    ? (obj['nextActions'] as unknown[])
        .map((s) => {
          const o = (s ?? {}) as Record<string, unknown>;
          const h = String(o['horizon'] ?? 'کوتاه‌مدت');
          return {
            title: str(o['title']),
            why: str(o['why']),
            ownerRole: str(o['ownerRole'], 'مالک کسب‌وکار'),
            horizon: (HORIZONS as readonly string[]).includes(h)
              ? (h as (typeof HORIZONS)[number])
              : ('کوتاه‌مدت' as const),
          };
        })
        .filter((a) => a.title !== '')
        .slice(0, 9)
    : [];

  return {
    headline: headline || statement,
    verdict: {
      band,
      statement: statement || ctx.fallbackStatement,
      confidence,
      needsConversation: Boolean(verdictRaw['needsConversation'] ?? false),
    },
    narrative: strArray(obj['narrative'], 8),
    strengths,
    risks,
    bottlenecks,
    inconsistencies: strArray(obj['inconsistencies'], 8),
    openQuestions: strArray(obj['openQuestions'], 10),
    nextActions,
    limitations: strArray(obj['limitations'], 8),
    meta: {
      provider: ctx.provider,
      model: ctx.model,
      status: 'ok',
      tier: ctx.tier,
      awaitingHumanReview: ctx.awaitingHumanReview,
      generatedAt: ctx.now,
    },
  };
}

/** استخراج اولین شیء JSON از متن مدل (مدل‌ها گاهی متن اضافه برمی‌گردانند) */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // تلاش دوم: از اولین { تا آخرین }
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const candidate = trimmed.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        throw new InterpretationValidationError('JSON یافت شد اما قابل تجزیه نبود');
      }
    }
    throw new InterpretationValidationError('در خروجی مدل JSON یافت نشد');
  }
}
