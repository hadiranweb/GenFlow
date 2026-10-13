/**
 * بارگذاری و اعتبارسنجی پرسش‌نامه‌ها از فایل‌های YAML
 *
 * چرا YAML؟ چون محتوای سؤال‌ها قطعاً چند بار عوض می‌شود و نباید برای هر تغییر،
 * کد دوباره کامپایل/دیپلوی شود. اعتبارسنجی سخت‌گیرانه است تا خطای محتوایی
 * (کد تکراری، وزن نامعتبر، گزینهٔ بدون سیگنال، ارجاع به سؤال ناموجود) در
 * زمان راه‌اندازی کشف شود، نه در وسط گفت‌وگوی کاربر.
 */
import { readFileSync } from 'node:fs';
import YAML from 'yaml';
import type {
  ConsistencyRule,
  GateMode,
  Polarity,
  QuestionDef,
  QuestionnaireDef,
  QuestionnaireKey,
  ResponseMode,
  SectionDef,
  Signal,
  SjtOption,
} from './types.js';

export class QuestionnaireError extends Error {}

function asNumber(v: unknown, ctx: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new QuestionnaireError(`${ctx}: مقدار باید عدد باشد`);
  }
  return v;
}

const SIGNALS: Signal[] = ['red', 'yellow', 'green'];

function parseOptions(raw: unknown, ctx: string): SjtOption[] {
  if (!Array.isArray(raw) || raw.length < 2) {
    throw new QuestionnaireError(`${ctx}: سناریوی SJT باید حداقل دو گزینه داشته باشد`);
  }
  const seen = new Set<string>();
  return raw.map((item, idx) => {
    const o = item as Record<string, unknown>;
    const key = String(o['key'] ?? '').trim();
    const text = String(o['text'] ?? '').trim();
    const signal = String(o['signal'] ?? '').trim();
    if (!key) throw new QuestionnaireError(`${ctx}: گزینهٔ شمارهٔ ${idx} کلید ندارد`);
    if (!text) throw new QuestionnaireError(`${ctx}: گزینهٔ «${key}» متن ندارد`);
    if (!SIGNALS.includes(signal as Signal)) {
      throw new QuestionnaireError(`${ctx}: گزینهٔ «${key}» سیگنال معتبر ندارد (red|yellow|green)`);
    }
    if (seen.has(key)) throw new QuestionnaireError(`${ctx}: کلید گزینهٔ تکراری «${key}»`);
    seen.add(key);
    const opt: SjtOption = { key, text, signal: signal as Signal };
    if (o['rationale'] !== undefined) opt.rationale = String(o['rationale']);
    return opt;
  });
}

function normalizeQuestion(raw: Record<string, unknown>, dimension: string, ctx: string): QuestionDef {
  const code = String(raw['code'] ?? '').trim();
  const text = String(raw['text'] ?? '').trim();
  if (!code) throw new QuestionnaireError(`${ctx}: کد سؤال خالی است`);
  if (!text) throw new QuestionnaireError(`${ctx} (${code}): متن سؤال خالی است`);

  const hasOptions = raw['options'] !== undefined && raw['options'] !== null;
  const defaultKind = hasOptions ? 'sjt' : 'scored';
  const kindRaw = String(raw['kind'] ?? defaultKind);
  if (!['scored', 'context', 'sjt'].includes(kindRaw)) {
    throw new QuestionnaireError(`${ctx} (${code}): kind باید scored، context یا sjt باشد`);
  }
  if (kindRaw === 'sjt' && !hasOptions) {
    throw new QuestionnaireError(`${ctx} (${code}): سؤال sjt باید options داشته باشد`);
  }

  const polarityRaw = String(raw['polarity'] ?? 'direct');
  if (polarityRaw !== 'direct' && polarityRaw !== 'reverse') {
    throw new QuestionnaireError(`${ctx} (${code}): polarity باید direct یا reverse باشد`);
  }

  const responseRaw = String(raw['response'] ?? (kindRaw === 'sjt' ? 'range' : 'range'));
  if (!['range', 'range+text'].includes(responseRaw)) {
    throw new QuestionnaireError(`${ctx} (${code}): response باید range یا range+text باشد`);
  }

  const questionWeight = raw['weight'] === undefined ? 1 : asNumber(raw['weight'], `${ctx} (${code}) وزن پرسش`);
  if (questionWeight < 0) throw new QuestionnaireError(`${ctx} (${code}): وزن پرسش نمی‌تواند منفی باشد`);

  const q: QuestionDef = {
    code,
    text,
    polarity: polarityRaw as Polarity,
    kind: kindRaw as QuestionDef['kind'],
    critical: Boolean(raw['critical'] ?? false),
    dimension,
    weight: questionWeight,
    response: responseRaw as ResponseMode,
  };
  if (raw['low'] !== undefined) q.low = String(raw['low']);
  if (raw['high'] !== undefined) q.high = String(raw['high']);
  if (raw['remedy_hint'] !== undefined) q.remedyHint = String(raw['remedy_hint']);
  if (raw['indicator'] !== undefined) q.indicator = String(raw['indicator']);
  if (hasOptions) q.options = parseOptions(raw['options'], `${ctx} (${code})`);
  return q;
}

function parseConsistencyRules(raw: unknown, allCodes: Set<string>, ctx: string): ConsistencyRule[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new QuestionnaireError(`${ctx}: consistency_rules باید فهرست باشد`);

  const rules: ConsistencyRule[] = [];
  raw.forEach((item, idx) => {
    const r = item as Record<string, unknown>;
    const code = String(r['code'] ?? '').trim();
    const title = String(r['title'] ?? '').trim();
    const message = String(r['message'] ?? '').trim();
    const when = r['when'];
    if (!code || !title) throw new QuestionnaireError(`${ctx}: قاعدهٔ ناسازگاری شمارهٔ ${idx} کد/عنوان ندارد`);
    if (!Array.isArray(when) || when.length === 0) {
      throw new QuestionnaireError(`${ctx} (${code}): when باید حداقل یک شرط داشته باشد`);
    }
    const conditions = when.map((c, ci) => {
      const cond = c as Record<string, unknown>;
      const question = String(cond['question'] ?? '');
      const op = String(cond['op'] ?? '');
      if (!allCodes.has(question)) {
        throw new QuestionnaireError(`${ctx} (${code}): شرط ${ci} به سؤال ناموجود «${question}» اشاره می‌کند`);
      }
      if (!['>=', '<=', '>', '<', '=='].includes(op)) {
        throw new QuestionnaireError(`${ctx} (${code}): عملگر «${op}» پشتیبانی نمی‌شود`);
      }
      return {
        question,
        op: op as ConsistencyRule['when'][number]['op'],
        value: asNumber(cond['value'], `${ctx} (${code}) مقدار شرط`),
      };
    });
    rules.push({ code, title, message, when: conditions });
  });
  return rules;
}

export function parseQuestionnaire(
  rawYaml: string,
  expectedKey: QuestionnaireKey,
  defaultMode: GateMode = 'weighted_scale',
): QuestionnaireDef {
  const doc = YAML.parse(rawYaml) as Record<string, unknown>;
  const ctx = `پرسش‌نامهٔ ${expectedKey}`;
  if (!doc || typeof doc !== 'object') throw new QuestionnaireError(`${ctx}: فایل خالی یا نامعتبر است`);

  const key = String(doc['key'] ?? expectedKey);
  if (key !== expectedKey) {
    throw new QuestionnaireError(`${ctx}: فیلد key باید «${expectedKey}» باشد، نه «${key}»`);
  }

  const modeRaw = String(doc['mode'] ?? (expectedKey === 'matrix' ? 'weighted_scale' : defaultMode));
  if (!['weighted_scale', 'sjt_knockout'].includes(modeRaw)) {
    throw new QuestionnaireError(`${ctx}: mode باید weighted_scale یا sjt_knockout باشد`);
  }
  if (modeRaw === 'sjt_knockout' && expectedKey === 'matrix') {
    throw new QuestionnaireError(`${ctx}: حالت sjt_knockout فقط برای گیت مجاز است`);
  }

  const scaleMin = asNumber(doc['scale_min'] ?? 0, `${ctx} scale_min`);
  const scaleMax = asNumber(doc['scale_max'] ?? 10, `${ctx} scale_max`);
  if (scaleMax <= scaleMin) throw new QuestionnaireError(`${ctx}: بازهٔ مقیاس نامعتبر است`);

  const sectionsRaw = doc['sections'];
  if (!Array.isArray(sectionsRaw) || sectionsRaw.length === 0) {
    throw new QuestionnaireError(`${ctx}: حداقل یک بخش لازم است`);
  }

  const seenCodes = new Set<string>();
  const sections: SectionDef[] = sectionsRaw.map((s, si) => {
    const sec = s as Record<string, unknown>;
    const code = String(sec['code'] ?? '').trim();
    const title = String(sec['title'] ?? '').trim();
    const weight = asNumber(sec['weight'] ?? 0, `${ctx} وزن بخش ${code || si}`);
    if (!code || !title) throw new QuestionnaireError(`${ctx}: بخش شمارهٔ ${si} کد/عنوان ندارد`);
    if (weight < 0) throw new QuestionnaireError(`${ctx} (${code}): وزن نمی‌تواند منفی باشد`);

    const qsRaw = sec['questions'];
    if (!Array.isArray(qsRaw) || qsRaw.length === 0) {
      throw new QuestionnaireError(`${ctx} (${code}): بخش بدون سؤال مجاز نیست`);
    }
    const questions = qsRaw.map((q) => {
      const parsed = normalizeQuestion(q as Record<string, unknown>, code, `${ctx} (${code})`);
      if (seenCodes.has(parsed.code)) {
        throw new QuestionnaireError(`${ctx}: کد سؤال تکراری «${parsed.code}»`);
      }
      seenCodes.add(parsed.code);
      return parsed;
    });

    const out: SectionDef = { code, title, weight, questions };
    if (sec['description'] !== undefined) out.description = String(sec['description']);
    return out;
  });

  const totalWeight = sections.reduce((acc, s) => acc + s.weight, 0);
  if (totalWeight <= 0) throw new QuestionnaireError(`${ctx}: مجموع وزن بخش‌ها باید بزرگ‌تر از صفر باشد`);

  const questionnaire: QuestionnaireDef = {
    key: expectedKey,
    mode: modeRaw as GateMode,
    version: String(doc['version'] ?? '0.0.0'),
    title: String(doc['title'] ?? ctx),
    intro: String(doc['intro'] ?? ''),
    scaleMin,
    scaleMax,
    sections,
    consistencyRules: parseConsistencyRules(doc['consistency_rules'], seenCodes, ctx),
  };
  return questionnaire;
}

export function loadQuestionnaire(
  filePath: string,
  key: QuestionnaireKey,
  defaultMode: GateMode = 'weighted_scale',
): QuestionnaireDef {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new QuestionnaireError(`خواندن فایل پرسش‌نامه ناموفق بود: ${filePath} — ${(err as Error).message}`);
  }
  return parseQuestionnaire(raw, key, defaultMode);
}

/** فهرست سؤال‌های امتیازدار به ترتیب مراحل (برای جریان گفت‌وگو و محاسبه) */
export function scoredQuestions(q: QuestionnaireDef): QuestionDef[] {
  return q.sections.flatMap((s) => s.questions).filter((x) => x.kind !== 'context');
}

/** همهٔ سؤال‌ها به ترتیب (برای نمایش/گفت‌وگو) */
export function allQuestions(q: QuestionnaireDef): QuestionDef[] {
  return q.sections.flatMap((s) => s.questions);
}

export function findQuestion(q: QuestionnaireDef, code: string): QuestionDef | undefined {
  return allQuestions(q).find((x) => x.code === code);
}
