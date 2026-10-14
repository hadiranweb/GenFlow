/**
 * «تفسیر داخلی رنجی» — همان لایهٔ پایه‌ای که دیاگرام فرایند گفته است:
 * «پاسخ رنجی کاربر (فقط رنج و نه پاسخ تشریحی) با استفاده از ماتریس تفسیر عارضه‌یابی
 *  به‌صورت داخلی (داخل خود سرور) تفسیر می‌شود.»
 *
 * دو کاربرد:
 *  ۱) لایهٔ پیش‌فرض تفسیر وقتی «تفسیر عمیق» خاموش است.
 *  ۲) شبکهٔ ایمنی: اگر مدل شکست خورد، سند بی‌تحلیل نمی‌ماند و شکست صریح در سند می‌آید.
 *
 * هیچ عدد جدیدی اینجا ساخته نمی‌شود؛ همه از ماتریس می‌آید.
 */
import type { ActionsVocab } from '../domain/content.js';
import type { Finding, Interpretation, RiskFinding } from '../domain/types.js';
import { bandLabel } from '../domain/matrix.js';
import { toPersianDigits } from '../util/time.js';
import type { InterpretInput } from './types.js';

function fmt(x: number, digits = 0): string {
  return toPersianDigits(digits > 0 ? x.toFixed(digits) : String(Math.round(x)));
}

/** آستانهٔ «قوی/ضعیف» برای الگوهای بین‌لایه‌ای سند (مقیاس ۰..۱۰۰) */
const PATTERN_STRONG_MIN = 60;
const PATTERN_WEAK_MAX = 60;

/** تشخیص الگوهای بین‌لایه‌ای ماتریس تفسیر روی نمره‌های محاسبه‌شده */
export function detectCrossLayerPatterns(
  input: InterpretInput,
): Array<{ id: string; meaning: string; actionFocus: string }> {
  const im = input.interpretationMatrix;
  if (!im) return [];
  const score = new Map(input.matrix.domains.map((d) => [d.code, d.score0to100]));
  const strong = (c?: string) => c !== undefined && (score.get(c) ?? -1) >= PATTERN_STRONG_MIN;
  const weak = (c?: string) => c !== undefined && (score.get(c) ?? 101) < PATTERN_WEAK_MAX;
  const hits: Array<{ id: string; meaning: string; actionFocus: string }> = [];
  for (const p of im.crossLayerPatterns) {
    const w = p.when;
    let ok = true;
    if (w.strong && !strong(w.strong)) ok = false;
    if (w.weak && !weak(w.weak)) ok = false;
    if (w.also_weak && !weak(w.also_weak)) ok = false;
    if (w.weak_any && !w.weak_any.some((c) => weak(c))) ok = false;
    if (ok) hits.push({ id: p.id, meaning: p.meaning, actionFocus: p.action_focus });
  }
  return hits;
}

export function deterministicInterpretation(
  input: InterpretInput,
  meta: { provider: string; model: string; status: 'ok' | 'fallback' | 'failed'; error?: string },
  vocab: ActionsVocab,
): Interpretation {
  const { matrix, now, explanations } = input;
  const im = input.interpretationMatrix;
  const weak = matrix.priorities.slice(0, 3);
  const strongest = matrix.domains[matrix.domains.length - 1];
  const symptomCritical = matrix.symptoms.filter((s) => s.critical);
  const needsConversation = matrix.gapToTarget > 0 || matrix.symptoms.length > 0;

  const headline =
    `وضعیت کلی نود: ${bandLabel(matrix.band)} (${fmt(matrix.overall0to100)} از ۱۰۰ · هدف ${fmt(input.targetIndex)}) — ` +
    `گلوگاه اصلی «${matrix.bottleneck.title}» با نمرهٔ ${fmt(matrix.bottleneck.score0to100)} و ` +
    `${fmt(matrix.priorities[0]?.gap ?? 0)} واحد شکاف`;

  const narrative: string[] = [];
  narrative.push(
    `نمرهٔ کل عارضه‌یابی ${fmt(matrix.overall0to100)} از ۱۰۰ و در دستهٔ «${bandLabel(matrix.band)}» است ` +
      `(رتبهٔ بلوغ سیستم‌سازی: «${matrix.maturity.label}»)؛ ` +
      `این عدد از ${fmt(matrix.answeredCount)} گزارهٔ پاسخ‌داده‌شده در ${fmt(matrix.domains.length)} محور ` +
      `با وزن‌دهی محورها محاسبه شده و فاصلهٔ آن تا امتیاز مطلوب ${fmt(input.targetIndex)} برابر ` +
      `${fmt(matrix.gapToTarget)} واحد است.`,
  );
  narrative.push(
    `از میان گزاره‌ها، ${fmt(matrix.severityCounts.critical)} مورد در وضعیت بحرانی (نمرهٔ ${fmt(input.symptomThreshold)} یا کمتر)، ` +
      `${fmt(matrix.severityCounts.warning)} هشدار، ${fmt(matrix.severityCounts.acceptable)} قابل قبول و ` +
      `${fmt(matrix.severityCounts.healthy)} سالم گزارش شده است. ` +
      `قوی‌ترین محور «${matrix.strongest.title}» (${fmt(matrix.strongest.score0to100)}) است و می‌تواند الگوی کاری سایر بخش‌ها شود.`,
  );
  if (weak.length > 1) {
    narrative.push(
      `اولویت‌بندی بر پایهٔ «شکاف × وزن محور»: ${weak
        .map((p, i) => `${fmt(i + 1)}) ${p.title} (شکاف ${fmt(p.gap)} · اولویت ${fmt(p.priority)})`)
        .join('، ')}. ` +
        `تمرکز بر بالاترین اولویت، بیشترین اثر را بر تصویر کلی دارد.`,
    );
  }
  if (symptomCritical.length > 0) {
    narrative.push(
      `در ${fmt(symptomCritical.length)} گزارهٔ کلیدی وضعیت بحرانی ثبت شده است: ` +
        symptomCritical
          .slice(0, 3)
          .map((s) => `«${s.text}» (${fmt(s.value)} از ۱۰ در محور ${s.dimensionTitle})`)
          .join('، ') +
        `. این‌ها ستون‌های اصلی نود هستند و پیش از هر اقدام دیگری باید تعیین تکلیف شوند.`,
    );
  }
  if (explanations.length > 0) {
    narrative.push(
      `برای ${fmt(explanations.length)} گزاره، توضیح تکمیلی ثبت شده است. توضیحات در محاسبهٔ نمره وارد نشده‌اند ` +
        `و فقط زمینهٔ تفسیر را کامل می‌کنند؛ در بخش «نیازمند گفت‌وگو» به مواردی که با عدد ناسازگارند اشاره شده است.`,
    );
  }

  // ---------------------------------------------- نقاط قوت
  const strengths: Finding[] = [];
  if (strongest) {
    strengths.push({
      title: `محور «${strongest.title}» نسبتاً سالم است`,
      evidence: `نمرهٔ محور ${fmt(strongest.score0to100)} از ۱۰۰ با ${fmt(strongest.strengths.length)} گزارهٔ سالم`,
      implication: 'این محور می‌تواند به‌عنوان الگوی کاری به سایر بخش‌ها منتقل شود.',
    });
    for (const s of strongest.strengths.slice(0, 2)) {
      strengths.push({
        title: s.text,
        evidence: `نمرهٔ ${fmt(s.value)} از ۱۰ در گزارهٔ ${s.questionCode}`,
        implication: 'این مورد را تثبیت کنید تا از افت تدریجی آن جلوگیری شود.',
      });
    }
  }

  // ---------------------------------------------- ریسک‌ها
  const risks: RiskFinding[] = [];
  for (const p of weak) {
    const domain = matrix.domains.find((d) => d.code === p.code);
    if (!domain) continue;
    for (const gap of domain.criticalGaps.slice(0, 2)) {
      risks.push({
        title: gap.text,
        severity: gap.value <= 2 ? 'high' : 'medium',
        evidence: `نمرهٔ ${fmt(gap.value)} از ۱۰ در گزارهٔ ${gap.questionCode} (محور ${domain.title})`,
        implication: `ادامهٔ وضعیت فعلی، «${domain.title}» را به گلوگاه کل نود تبدیل می‌کند.`,
        mitigation: vocab.domains[domain.code]?.actions[0]?.title ?? 'تعریف اقدام مشخص با مسئول و زمان',
      });
    }
  }
  if (risks.length === 0 && strongest) {
    risks.push({
      title: 'هیچ گزارهٔ بحرانی ثبت نشد',
      severity: 'low',
      evidence: `صفر گزاره در وضعیت بحرانی از ${fmt(matrix.answeredCount)} گزارهٔ اندازه‌گیری‌شده`,
      implication: 'تصویر فعلی ریسک حاد نشان نمی‌دهد؛ اما نبود ریسک حاد به معنای کافی‌بودن داده نیست.',
      mitigation: 'پایش دوره‌ای همان سنجه‌ها برای تشخیص افت تدریجی',
    });
  }

  // ---------------------------------------------- ناسازگاری عدد و توضیح
  const inconsistencies: string[] = [];
  for (const s of matrix.symptoms) {
    if (!s.explanation) continue;
    inconsistencies.push(
      `گزارهٔ «${s.text}» نمرهٔ ${fmt(s.value)} از ۱۰ گرفته (عارضهٔ مشاهده‌شده) اما توضیح شما: «${s.explanation}» — ` +
        `این فاصله را در گفت‌وگو روشن کنید.`,
    );
    if (inconsistencies.length >= 4) break;
  }
  for (const st of matrix.domains.flatMap((d) => d.strengths).slice(0, 3)) {
    const explained = explanations.find((e) => e.questionCode === st.questionCode);
    if (explained) {
      inconsistencies.push(
        `گزارهٔ «${st.text}» نمرهٔ ${fmt(st.value)} از ۱۰ گرفته (سالم) اما توضیح شما نکتهٔ دیگری را مطرح می‌کند: «${explained.text}»`,
      );
      break;
    }
  }

  // ---------------------------------------------- پرسش‌های باز
  const openQuestions: string[] = [];
  for (const d of matrix.domains.filter((x) => x.criticalBelowThreshold)) {
    openQuestions.push(
      `در محور «${d.title}» گزارهٔ کلیدی زیر آستانهٔ عارضه است؛ علت ریشه‌ای آن و کسی که مسئول رفع آن می‌شود چه کسی است؟`,
    );
  }
  for (const d of matrix.domains.filter((x) => x.dispersion > 0.35).slice(0, 2)) {
    openQuestions.push(
      `در محور «${d.title}» پراکندگی پاسخ‌ها بالاست (${fmt(d.dispersion, 2)})؛ تصویر تیم از این حوزه یکسان نیست — کدام برداشت درست‌تر است؟`,
    );
  }
  if (explanations.length === 0) {
    openQuestions.push(
      'هیچ توضیح تکمیلی ثبت نشده است؛ برای دقت بیشتر، زمینهٔ انسانی نود باید در گفت‌وگو روشن شود.',
    );
  }
  if (openQuestions.length === 0) {
    openQuestions.push('برای تصمیم دقیق‌تر، اولویت‌های دورهٔ بعد و محدودیت‌های واقعی تیم باید در گفت‌وگو روشن شود.');
  }

  // ---------------------------------------------- اقدام‌ها
  // اولویت با اقدام‌های ماتریس تفسیر (درخت کلیدواژهٔ سند) است؛ کتابخانهٔ
  // اقدام همان عناوین را نگه می‌دارد و «چرا/مسئول/افق» را کامل می‌کند.
  const nextActions: Interpretation['nextActions'] = [];
  for (const p of weak) {
    const v = vocab.domains[p.code];
    const layer = im?.layers[p.code];
    if (layer) {
      for (const node of layer.keyword_tree) {
        const match = v?.actions.find((a) => a.keyword_ref === node.id) ?? v?.actions.find((a) => a.title === node.title);
        nextActions.push({
          title: node.title,
          why: match?.why ?? layer.as_is,
          ownerRole: v?.owner_role ?? 'مالک کسب‌وکار',
          horizon: match?.horizon ?? 'کوتاه‌مدت',
        });
      }
      continue;
    }
    if (!v) continue;
    for (const a of v.actions.slice(0, 2)) {
      nextActions.push({ title: a.title, why: a.why, ownerRole: v.owner_role, horizon: a.horizon });
    }
  }
  if (nextActions.length === 0) {
    nextActions.push({
      title: 'برگزاری جلسهٔ گفت‌وگوی زمینه‌ای',
      why: 'دادهٔ کافی برای اولویت‌بندی اقدام وجود ندارد؛ ابتدا باید تصویر روشن شود.',
      ownerRole: 'مسئول ارزیابی',
      horizon: 'کوتاه‌مدت',
    });
  }

  // ---------------------------------------------- محدودیت‌ها
  const limitations = [
    'نمره‌ها از پاسخ‌های خودگزارشی شما محاسبه شده‌اند و مانند هر ابزار خودگزارشی، به دقت پاسخ‌دهی وابسته‌اند.',
    `آستانه‌ها ثابت‌اند: امتیاز مطلوب ${fmt(input.targetIndex)}، «عارضهٔ مشاهده‌شده» نمرهٔ ${fmt(input.symptomThreshold)} یا کمتر.`,
    'این تحلیل، تشخیص تخصصی یا مشاورهٔ حقوقی/مالی نیست و جایگزین ارزیابی متخصص انسانی نمی‌شود.',
    'نمره‌ها فقط از پاسخ‌های رنجی محاسبه شده‌اند؛ توضیحات شما در محاسبه وارد نشده‌اند.',
  ];
  if (meta.status !== 'ok') {
    limitations.push(
      'تفسیر با مدل زبانی در این نوبت انجام نشد و متن حاضر از موتور قاعده‌محور داخلی تولید شده است' +
        (meta.error ? ` (علت: ${meta.error})` : '.'),
    );
  }
  if (input.awaitingHumanReview) {
    limitations.push('این متن پیش‌نویس است و پیش از تصمیم نهایی باید بازبینی انسانی شود.');
  }

  return {
    headline,
    verdict: {
      band: matrix.band,
      statement:
        `وضعیت نود «${bandLabel(matrix.band)}» ارزیابی می‌شود (${fmt(matrix.overall0to100)} از ۱۰۰، هدف ${fmt(input.targetIndex)}). ` +
        `گلوگاه اصلی «${matrix.bottleneck.title}» با ${fmt(matrix.priorities[0]?.gap ?? 0)} واحد شکاف است. ` +
        (needsConversation
          ? 'اقدام‌های پیشنهادی به‌ترتیب اولویت در بخش بعد آمده و موارد نیازمند گفت‌وگو علامت‌گذاری شده‌اند.'
          : 'وضعیت فعلی ریسک حاد نشان نمی‌دهد؛ پایش دوره‌ای توصیه می‌شود.'),
      confidence: matrix.answeredCount === matrix.totalQuestions ? 'high' : 'medium',
      needsConversation: matrix.symptoms.length > 0,
    },
    narrative,
    strengths,
    risks,
    bottlenecks: weak.map((p) => ({
      domainCode: p.code,
      domainTitle: p.title,
      score0to100: p.score0to100,
      why: `نمرهٔ ${fmt(p.score0to100)} از ۱۰۰ → شکاف ${fmt(p.gap)} واحد تا هدف، با وزن ${fmt(p.weight, 2)} و اولویت ${fmt(p.priority)}.`,
    })),
    inconsistencies,
    openQuestions,
    nextActions,
    limitations,
    meta: {
      provider: meta.provider,
      model: meta.model,
      status: meta.status,
      tier: input.tier,
      awaitingHumanReview: input.awaitingHumanReview,
      generatedAt: now,
      ...(meta.error ? { error: meta.error } : {}),
    },
  };
}
