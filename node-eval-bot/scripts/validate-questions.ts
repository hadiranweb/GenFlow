/**
 * اعتبارسنجی محتوا و نمایش خلاصهٔ ساختار + تحلیل اثر وزن‌دهی.
 *   npm run lint:questions
 */
import path from 'node:path';
import { loadContent } from '../src/domain/content.js';
import { toPersianDigits } from '../src/util/time.js';

function main(): void {
  const dataDir = path.resolve(process.env['DATA_DIR'] ?? 'data');
  const content = loadContent(dataDir);

  process.stdout.write('📋 بررسی محتوای فرایند\n' + '─'.repeat(60) + '\n');

  for (const [label, q] of [
    ['مرحله ۱ — ارزیابی نود (لیبل)', content.gate],
    ['مرحله ۲ — عارضه‌یابی تفصیلی', content.matrix],
  ] as const) {
    const all = q.sections.flatMap((s) => s.questions);
    const critical = all.filter((x) => x.critical);
    const withText = all.filter((x) => x.response === 'range+text');
    const weightSum = q.sections.reduce((a, s) => a + s.weight, 0);
    process.stdout.write(
      [
        `\n${label}`,
        `   موتور: ${q.mode} · نسخه: ${q.version}`,
        `   پرسش‌ها: ${toPersianDigits(all.length)} (کلیدی: ${toPersianDigits(critical.length)} · دو ساید: ${toPersianDigits(withText.length)})`,
        `   محورها: ${q.sections.length} · جمع وزن: ${weightSum.toFixed(2)}`,
        `   توزیع: ${q.sections.map((s) => `${s.title}(${toPersianDigits(s.questions.length)})`).join(' · ')}`,
        `   کدهای کلیدی: ${critical.map((c) => c.code).join(', ') || '—'}`,
      ].join('\n') + '\n',
    );
  }

  process.stdout.write(
    [
      '\n⚙️ سیاست محاسبهٔ ارزیابی (scoring/gate.yaml)',
      `   نسخه: ${content.gateScoring.version} · وزن‌دهی: ${content.gateScoring.weighting}`,
      `   نواحی: ${content.gateScoring.zones.map((z) => `${z.label} ≥ ${toPersianDigits(z.min)}`).join(' | ')}`,
      `   سقف کلیدی: ≤ ${toPersianDigits(content.gateScoring.criticalCeiling.criticalRedMax)} → قرمز · ` +
        `≤ ${toPersianDigits(content.gateScoring.criticalCeiling.criticalYellowMax)} → زرد · ` +
        `بی‌پاسخ ${content.gateScoring.criticalCeiling.unansweredIsFlagged ? 'پرچم‌دار' : 'بدون اثر'}`,
      '',
      '⚙️ سیاست محاسبهٔ عارضه‌یابی (scoring/matrix.yaml)',
      `   نسخه: ${content.matrixScoring.version} · هدف: ${toPersianDigits(content.matrixScoring.targetIndex)} · ` +
        `آستانهٔ عارضه: ≤ ${toPersianDigits(content.matrixScoring.symptomThreshold)}`,
      `   دسته‌ها: ${toPersianDigits(content.matrixScoring.severityBands.healthy)} / ` +
        `${toPersianDigits(content.matrixScoring.severityBands.borderline)} / ${toPersianDigits(content.matrixScoring.severityBands.needs_fix)}`,
      `   توضیح متنی: ${content.matrixScoring.interpretation.explanationRequired ? 'اجباری' : 'اختیاری'} · ` +
        `ارسال به مفسر عمیق: ${content.matrixScoring.interpretation.explanationsToAi ? 'بله' : 'خیر'}`,
      `   کلیدهای مدیر (پیش‌فرض فایل): تفسیر عمیق=${content.matrixScoring.adminKeys.deepInterpretation} · ` +
        `تفسیر AI=${content.matrixScoring.adminKeys.aiInterpretation}`,
      '',
      `✅ محتوا معتبر است (${Object.keys(content.actions.domains).length} محور کتابخانهٔ اقدام).`,
    ].join('\n') + '\n',
  );
}

try {
  main();
} catch (err) {
  process.stderr.write(`❌ محتوای نامعتبر: ${(err as Error).message}\n`);
  process.exit(1);
}
