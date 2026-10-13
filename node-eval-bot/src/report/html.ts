/**
 * تولید سند HTML — تک‌فایلی، RTL، بدون منبع بیرونی (CDN/فونت آنلاین).
 *
 * نکتهٔ مهم مطابق فرایند اصلی: این سند فقط دربارهٔ **عارضه‌یابی** است.
 * لیبل ارزیابی اولیه در سند نیامده است (فقط در پرونده/سطح مدیریت می‌ماند).
 * همهٔ متن‌های پویا (توضیح کاربر + خروجی مدل) از escapeHtml عبور می‌کنند.
 */
import type {
  AnswersMap,
  ExplanationPayloadItem,
  Interpretation,
  MatrixResult,
  MatrixScoringConfig,
  QuestionnaireDef,
} from '../domain/types.js';
import { bandLabel } from '../domain/matrix.js';
import { escapeHtml } from '../util/html.js';
import { formatJalaliDateTime, toPersianDigits } from '../util/time.js';

export interface ReportInput {
  reportId: string;
  sessionId: string;
  sessionNo: number;
  serial: number | null;
  generatedAt: Date;
  matrix: MatrixResult;
  matrixQuestionnaire: QuestionnaireDef;
  matrixScoring: MatrixScoringConfig;
  matrixAnswers: AnswersMap;
  explanations: ExplanationPayloadItem[];
  interpretation: Interpretation;
  contentHash: string;
}

function fa(n: number, digits = 0): string {
  return toPersianDigits(digits > 0 ? n.toFixed(digits) : String(Math.round(n)));
}

const BAND_COLORS: Record<MatrixResult['band'], string> = {
  healthy: '#15803d',
  borderline: '#b45309',
  needs_fix: '#c2410c',
  critical: '#b91c1c',
};

const BAND_BG: Record<MatrixResult['band'], string> = {
  healthy: '#dcfce7',
  borderline: '#fef3c7',
  needs_fix: '#ffedd5',
  critical: '#fee2e2',
};

function bandChip(band: MatrixResult['band']): string {
  return `<span class="chip" style="background:${BAND_BG[band]};color:${BAND_COLORS[band]};border-color:${BAND_COLORS[band]}">${escapeHtml(bandLabel(band))}</span>`;
}

function bar(label: string, score: number, band: MatrixResult['band'], extra?: string): string {
  const w = Math.max(0, Math.min(100, score));
  return `
    <div class="bar-row">
      <div class="bar-head">
        <span class="bar-label">${escapeHtml(label)}</span>
        <span class="bar-value">${fa(w)}<small>/۱۰۰</small>${extra ? ` <span class="muted">${escapeHtml(extra)}</span>` : ''}</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${w.toFixed(1)}%;background:${BAND_COLORS[band]}"></div></div>
    </div>`;
}

export function renderReportHtml(input: ReportInput): string {
  const { matrix, interpretation: itp, matrixScoring } = input;
  const band = matrix.band;
  const now = input.generatedAt;

  const domainBars = matrix.domains
    .slice()
    .sort((a, b) => a.score0to100 - b.score0to100)
    .map((d) => {
      const priorityRow = matrix.priorities.find((p) => p.code === d.code);
      const extra = priorityRow ? `شکاف ${fa(priorityRow.gap)} · اولویت ${fa(priorityRow.priority)}` : undefined;
      return bar(d.title, d.score0to100, d.band, extra);
    })
    .join('');

  const priorityRows = matrix.priorities
    .slice(0, 6)
    .map(
      (p, i) => `<tr>
        <td class="num">${fa(i + 1)}</td>
        <td>${escapeHtml(p.title)}</td>
        <td class="num">${fa(p.score0to100)}</td>
        <td>${bandChip(p.band)}</td>
        <td class="num">${fa(p.gap)}</td>
        <td class="num">${fa(p.weight, 2)}</td>
        <td class="num"><strong>${fa(p.priority)}</strong></td>
        <td class="num">${fa(p.criticalWeakCount)}</td>
      </tr>`,
    )
    .join('');

  const symptomRows = matrix.symptoms
    .map(
      (s) => `<tr>
        <td class="q-code">${escapeHtml(s.questionCode)}</td>
        <td>${escapeHtml(s.text)}</td>
        <td class="num ${s.value <= 2 ? 'sev-critical' : 'sev-warning'}">${fa(s.value)}</td>
        <td class="muted">${escapeHtml(s.dimensionTitle)}${s.critical ? ' <span class="chip sev-critical">کلیدی</span>' : ''}</td>
        <td class="small">${s.explanation ? escapeHtml(s.explanation) : '<span class="muted">—</span>'}</td>
      </tr>`,
    )
    .join('');

  const risksHtml = itp.risks.length
    ? itp.risks
        .map(
          (r) => `
      <div class="item">
        <div class="item-title">${escapeHtml(r.title)}
          <span class="chip ${r.severity === 'high' ? 'sev-critical' : r.severity === 'medium' ? 'sev-warning' : 'sev-healthy'}">شدت ${escapeHtml(r.severity === 'high' ? 'بالا' : r.severity === 'medium' ? 'متوسط' : 'پایین')}</span>
        </div>
        <div class="small"><strong>شاهد:</strong> ${escapeHtml(r.evidence)}</div>
        <div class="small"><strong>پیامد:</strong> ${escapeHtml(r.implication)}</div>
        ${r.mitigation ? `<div class="small"><strong>کاهنده:</strong> ${escapeHtml(r.mitigation)}</div>` : ''}
      </div>`,
        )
        .join('')
    : '<p class="muted">ریسک برجسته‌ای از داده استخراج نشد.</p>';

  const strengthsHtml = itp.strengths.length
    ? itp.strengths
        .map(
          (s) => `
      <div class="item">
        <div class="item-title">${escapeHtml(s.title)}</div>
        <div class="small"><strong>شاهد:</strong> ${escapeHtml(s.evidence)}</div>
        ${s.implication ? `<div class="small"><strong>نکته:</strong> ${escapeHtml(s.implication)}</div>` : ''}
      </div>`,
        )
        .join('')
    : '<p class="muted">نقطهٔ قوت برجسته‌ای از داده استخراج نشد.</p>';

  const inconsistenciesHtml = itp.inconsistencies.length
    ? `<ul class="tight">${itp.inconsistencies.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`
    : '<p class="muted">ناسازگاری معناداری بین نمره‌ها و توضیحات شما دیده نشد.</p>';

  const actionsHtml = itp.nextActions.length
    ? `<table class="tbl">
        <thead><tr><th>#</th><th>اقدام</th><th>چرا</th><th>مسئول پیشنهادی</th><th>افق</th></tr></thead>
        <tbody>
        ${itp.nextActions
          .map(
            (a, i) => `<tr>
              <td class="num">${fa(i + 1)}</td>
              <td>${escapeHtml(a.title)}</td>
              <td class="small">${escapeHtml(a.why)}</td>
              <td class="small">${escapeHtml(a.ownerRole)}</td>
              <td class="small">${escapeHtml(a.horizon)}</td>
            </tr>`,
          )
          .join('')}
        </tbody></table>`
    : '<p class="muted">اقدامی پیشنهاد نشد.</p>';

  const openQuestionsHtml = itp.openQuestions.length
    ? `<ul class="tight">${itp.openQuestions.map((q) => `<li>${escapeHtml(q)}</li>`).join('')}</ul>`
    : '<p class="muted">پرسش باز خاصی ثبت نشد.</p>';

  const limitationsHtml = itp.limitations.length
    ? `<ul class="tight">${itp.limitations.map((q) => `<li>${escapeHtml(q)}</li>`).join('')}</ul>`
    : '';

  const answerRows = input.matrixQuestionnaire.sections
    .flatMap((s) =>
      s.questions.map((q) => {
        const rec = input.matrixAnswers[q.code];
        const value = typeof rec?.value === 'number' ? rec.value : null;
        const cls = value === null ? 'muted' : value <= matrixScoring.symptomThreshold ? 'sev-critical' : value <= 6 ? 'sev-warning' : 'sev-healthy';
        return `<tr>
          <td class="q-code">${escapeHtml(q.code)}</td>
          <td>${escapeHtml(q.text)}</td>
          <td class="num ${cls}">${value === null ? '—' : fa(value)}</td>
          <td class="muted">${escapeHtml(s.title)}</td>
          <td class="small">${rec?.explanation ? escapeHtml(rec.explanation) : '<span class="muted">—</span>'}</td>
        </tr>`;
      }),
    )
    .join('');

  const tierNotice =
    itp.meta.tier === 'deep_ai'
      ? `<div class="notice warn">
           این سند با کمک <strong>مفسر عمیق (مدل زبانی)</strong> تهیه شده است.${
             itp.meta.awaitingHumanReview
               ? ' این متن <strong>پیش‌نویس</strong> است و پیش از تصمیم نهایی باید بازبینی انسانی شود.'
               : ''
           }
         </div>`
      : '';
  const fallbackNotice =
    itp.meta.status === 'ok'
      ? ''
      : `<div class="notice warn">
           <strong>توجه:</strong> تفسیر با مدل زبانی در این نوبت انجام نشد و تحلیل حاضر از موتور قاعده‌محور داخلی تولید شده است.
           ${itp.meta.error ? `<div class="small muted">${escapeHtml(itp.meta.error)}</div>` : ''}
         </div>`;

  const serialText = input.serial === null ? '—' : toPersianDigits(input.serial);

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>سند عارضه‌یابی — ${escapeHtml(input.sessionId.slice(0, 8))}</title>
<style>
  :root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#f6f8fb;--card:#fff;--accent:#1d4ed8}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:Vazirmatn,"IRANSans","Segoe UI",Tahoma,system-ui,sans-serif;line-height:1.9;font-size:15px}
  .wrap{max-width:1040px;margin:0 auto;padding:28px 18px 64px}
  header.top{background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;border-radius:18px;padding:26px 24px;box-shadow:0 10px 30px rgba(15,23,42,.18)}
  header.top h1{margin:0 0 6px;font-size:24px}
  header.top .sub{opacity:.85;font-size:13px}
  .meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-top:18px}
  .meta-grid div{background:rgba(255,255,255,.09);border-radius:12px;padding:10px 12px;font-size:12.5px}
  .meta-grid b{display:block;font-size:11px;opacity:.75;font-weight:500;margin-bottom:3px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;margin-top:18px}
  .card h2{margin:0 0 14px;font-size:18px;border-right:4px solid var(--accent);padding-right:10px}
  .verdict{display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:space-between}
  .band-badge{color:#fff;border-radius:999px;padding:9px 20px;font-weight:700;font-size:16px;display:inline-block}
  .score-big{font-size:40px;font-weight:800;line-height:1}
  .score-big small{font-size:15px;color:var(--muted);font-weight:500}
  .kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px}
  .kv div{background:#f8fafc;border:1px solid var(--line);border-radius:12px;padding:10px 12px;font-size:13px}
  .kv b{display:block;color:var(--muted);font-size:11px;font-weight:500}
  .bar-row{margin:10px 0}
  .bar-head{display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:5px}
  .bar-value{font-weight:700}
  .bar-value small{color:var(--muted);font-weight:400}
  .bar-track{background:#eef2f7;border-radius:999px;height:11px;overflow:hidden}
  .bar-fill{height:100%;border-radius:999px}
  .item{border-right:3px solid var(--line);padding:8px 12px 8px 0;margin:10px 0}
  .item-title{font-weight:700;margin-bottom:4px}
  .small{font-size:13px}
  .muted{color:var(--muted)}
  .tight{margin:6px 0;padding-right:18px}
  .tight li{margin:4px 0;font-size:13.5px}
  .tbl{width:100%;border-collapse:collapse;font-size:13px}
  .tbl th,.tbl td{border:1px solid var(--line);padding:8px 10px;text-align:right;vertical-align:top}
  .tbl th{background:#f1f5f9;font-weight:600}
  .tbl tbody tr:nth-child(even){background:#fafcff}
  .num{font-variant-numeric:tabular-nums;font-weight:700;text-align:center;white-space:nowrap}
  .q-code{font-size:11px;color:var(--muted);white-space:nowrap;direction:ltr;text-align:left}
  .sev-critical{color:#b91c1c}.sev-warning{color:#b45309}.sev-acceptable{color:#0f766e}.sev-healthy{color:#15803d}
  .chip{display:inline-block;border-radius:999px;padding:2px 10px;font-size:11.5px;border:1px solid var(--line);background:#f8fafc}
  .notice{border-radius:12px;padding:12px 14px;margin-top:14px;font-size:13.5px}
  .notice.warn{background:#fffbeb;border:1px solid #fde68a}
  .disclaimer{margin-top:16px;font-size:13px;color:#475569;background:#f8fafc;border:1px dashed var(--line);border-radius:12px;padding:12px 14px}
  footer{margin-top:26px;text-align:center;color:var(--muted);font-size:12px}
  .hash{direction:ltr;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;color:var(--muted);word-break:break-all}
  @media print{
    body{background:#fff;font-size:12.5px}
    .card{break-inside:avoid;box-shadow:none}
    header.top{background:#0f172a !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .bar-fill,.band-badge,.chip{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }
</style>
</head>
<body>
<div class="wrap">

  <header class="top">
    <h1>سند عارضه‌یابی نود</h1>
    <div class="sub">این سند بر پایهٔ پاسخ‌های رنجی شما (۰..۱۰) و با فرمول قطعی محاسبه شده است؛ تفسیر بر پایهٔ همان اعداد و توضیحات تکمیلی شماست.</div>
    <div class="meta-grid">
      <div><b>شمارهٔ سری سند</b>${serialText}</div>
      <div><b>نشست</b>شمارهٔ ${toPersianDigits(input.sessionNo)}</div>
      <div><b>تاریخ تولید</b>${escapeHtml(formatJalaliDateTime(now))}</div>
      <div><b>نسخهٔ فرمول</b><span class="hash">${escapeHtml(matrix.formulaVersion)}</span></div>
      <div><b>وضعیت</b>${bandChip(band)}</div>
    </div>
  </header>

  <!-- ===================== خلاصهٔ مدیریتی ===================== -->
  <section class="card">
    <h2>خلاصهٔ مدیریتی</h2>
    <div class="verdict">
      <div><span class="band-badge" style="background:${BAND_COLORS[band]}">${escapeHtml(bandLabel(band))}</span></div>
      <div style="text-align:center">
        <div class="score-big" style="color:${BAND_COLORS[band]}">${fa(matrix.overall0to100)}<small> / ۱۰۰</small></div>
        <div class="muted small">امتیاز عارضه‌یابی (هدف: ${fa(matrix.targetIndex)})</div>
      </div>
      <div>
        <div class="muted small">فاصله تا هدف</div>
        <div style="font-weight:700">${fa(matrix.gapToTarget)} واحد</div>
      </div>
    </div>
    <p style="font-weight:700">${escapeHtml(itp.headline)}</p>
    <p>${escapeHtml(itp.verdict.statement)}</p>
    <div class="kv">
      <div><b>گلوگاه اصلی</b>${escapeHtml(matrix.bottleneck.title)} (${fa(matrix.bottleneck.score0to100)})</div>
      <div><b>قوی‌ترین محور</b>${escapeHtml(matrix.strongest.title)} (${fa(matrix.strongest.score0to100)})</div>
      <div><b>عارضه‌های مشاهده‌شده</b>${fa(matrix.symptoms.length)} از ${fa(matrix.answeredCount)}</div>
      <div><b>توضیحات ثبت‌شده</b>${fa(matrix.explanationsCount)}</div>
    </div>
    ${tierNotice}
    ${fallbackNotice}
  </section>

  <!-- ===================== تصویر وضع موجود ===================== -->
  <section class="card">
    <h2>تصویر وضع موجود (۹ محور)</h2>
    ${domainBars}
    <p class="small muted">
      دسته‌بندی: ≥ ${fa(matrixScoring.severityBands.healthy)} مطلوب · ${fa(matrixScoring.severityBands.borderline)}..${fa(matrixScoring.severityBands.healthy)} مرزی ·
      ${fa(matrixScoring.severityBands.needs_fix)}..${fa(matrixScoring.severityBands.borderline)} نیازمند اصلاح · کمتر از ${fa(matrixScoring.severityBands.needs_fix)} بحرانی.
    </p>
  </section>

  <!-- ===================== اولویت‌بندی ===================== -->
  <section class="card">
    <h2>اولویت‌بندی بر پایهٔ شکاف × وزن</h2>
    <table class="tbl">
      <thead><tr><th>#</th><th>محور</th><th>نمره</th><th>وضعیت</th><th>شکاف</th><th>وزن</th><th>اولویت</th><th>عارضهٔ کلیدی</th></tr></thead>
      <tbody>${priorityRows}</tbody>
    </table>
    <p class="small muted">«اولویت» = شکاف تا هدف × وزن محور. بالاترین عدد، بیشترین اثر را بر تصویر کلی دارد.</p>
  </section>

  <!-- ===================== عارضه‌ها ===================== -->
  <section class="card">
    <h2>عارضه‌های مشاهده‌شده (نمرهٔ ${fa(matrixScoring.symptomThreshold)} یا کمتر)</h2>
    ${matrix.symptoms.length ? `<table class="tbl">
      <thead><tr><th>کد</th><th>گزاره</th><th>نمره</th><th>محور</th><th>توضیح شما</th></tr></thead>
      <tbody>${symptomRows}</tbody>
    </table>` : '<p class="muted">هیچ گزاره‌ای در وضعیت بحرانی ثبت نشد.</p>'}
  </section>

  <!-- ===================== تحلیل ===================== -->
  <section class="card">
    <h2>تحلیل تفصیلی</h2>
    ${itp.narrative.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
  </section>

  <section class="card">
    <h2>گلوگاه‌ها و ریسک‌ها</h2>
    ${
      itp.bottlenecks.length
        ? `<ul class="tight">${itp.bottlenecks
            .map((b) => `<li><strong>${escapeHtml(b.domainTitle)}</strong> (${fa(b.score0to100)} از ۱۰۰) — ${escapeHtml(b.why)}</li>`)
            .join('')}</ul>`
        : ''
    }
    ${risksHtml}
  </section>

  <section class="card">
    <h2>نقاط قوت و دارایی‌های قابل اتکا</h2>
    ${strengthsHtml}
  </section>

  <section class="card">
    <h2>ناسازگاری عدد و توضیح (نیازمند روشن‌سازی)</h2>
    <p class="small muted">این موارد ارزشمندترین بخش تحلیل‌اند: جایی که عدد با توضیح شما هم‌خوان نیست.</p>
    ${inconsistenciesHtml}
  </section>

  <section class="card">
    <h2>اقدام‌های پیشنهادی</h2>
    ${actionsHtml}
  </section>

  <section class="card">
    <h2>نیازمند گفت‌وگو</h2>
    ${openQuestionsHtml}
  </section>

  <section class="card">
    <h2>محدودیت‌ها و سلب مسئولیت</h2>
    ${limitationsHtml}
    <div class="disclaimer">
      این خروجی <strong>کمک‌تصمیم</strong> است و جایگزین ارزیابی تخصصی انسانی نیست.
      نمره‌ها فقط از پاسخ‌های رنجی محاسبه شده‌اند؛ توضیحات شما در محاسبه وارد نشده‌اند و تنها زمینهٔ تفسیر را کامل می‌کنند.
      هیچ مسیر پذیرفته‌شده‌ای نباید بدون مسئول، دلیل و زمان پیگیری باقی بماند.
    </div>
  </section>

  <!-- ===================== پیوست ===================== -->
  <section class="card">
    <h2>پیوست ۱ — تنظیمات محاسبه (قابل بازبینی)</h2>
    <table class="tbl">
      <thead><tr><th>پارامتر</th><th>مقدار</th></tr></thead>
      <tbody>
        <tr><td>امتیاز مطلوب (هدف)</td><td class="num">${fa(matrixScoring.targetIndex)}</td></tr>
        <tr><td>آستانهٔ «عارضهٔ مشاهده‌شده»</td><td class="num">≤ ${fa(matrixScoring.symptomThreshold)}</td></tr>
        <tr><td>آستانه‌های دسته‌بندی</td><td class="num">${fa(matrixScoring.severityBands.healthy)} / ${fa(matrixScoring.severityBands.borderline)} / ${fa(matrixScoring.severityBands.needs_fix)}</td></tr>
        <tr><td>وزن‌دهی محورها</td><td class="small">${escapeHtml(matrix.domains.map((d) => `${d.title}: ${fa(d.weight, 2)}`).join(' · '))}</td></tr>
        <tr><td>نسخهٔ فرم</td><td class="hash">${escapeHtml(input.matrixQuestionnaire.version)}</td></tr>
        <tr><td>نسخهٔ محاسبه</td><td class="hash">${escapeHtml(matrix.formulaVersion)}</td></tr>
        <tr><td>موتور تفسیر</td><td class="hash">${escapeHtml(itp.meta.provider)}/${escapeHtml(itp.meta.model)} (${escapeHtml(itp.meta.tier)})</td></tr>
      </tbody>
    </table>
  </section>

  <section class="card">
    <h2>پیوست ۲ — پاسخ‌های خام و توضیحات</h2>
    <table class="tbl">
      <thead><tr><th>کد</th><th>گزاره</th><th>نمره</th><th>محور</th><th>توضیح شما</th></tr></thead>
      <tbody>${answerRows}</tbody>
    </table>
  </section>

  <footer>
    <div>شناسهٔ گزارش: <span class="hash">${escapeHtml(input.reportId)}</span> · شناسهٔ نشست: <span class="hash">${escapeHtml(input.sessionId)}</span></div>
    <div style="margin-top:6px">اثر انگشت محتوا (SHA-256 پاسخ‌های رنجی + نسخهٔ فرمول‌ها):</div>
    <div class="hash">${escapeHtml(input.contentHash)}</div>
  </footer>
</div>
</body>
</html>`;
}
