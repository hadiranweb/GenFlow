/**
 * ساخت یک پروندهٔ نمایشی در دیتابیس (بدون تلگرام) برای بررسی سرتاسری:
 *
 *   npm run build && npm run seed        → شناسهٔ گزارش و لینک را چاپ می‌کند
 *   BOT_MODE=disabled node dist/index.js → سرور بالا می‌آید
 *   curl http://localhost:8080/reports/<id>
 *
 * ⚠️ دادهٔ ساختگی در دیتابیس می‌سازد؛ روی محیط production اجرا نکنید.
 */
import { loadConfig } from '../src/config.js';
import { loadContent } from '../src/domain/content.js';
import { openDb } from '../src/storage/db.js';
import { Repo } from '../src/storage/repo.js';
import { FlowService } from '../src/bot/flow.js';
import { scoreGate } from '../src/domain/scoring.js';
import { buildMatrix, collectExplanations, toMatrixBundle } from '../src/domain/matrix.js';
import { MockLlmProvider } from '../src/llm/mock.js';
import { generateReport } from '../src/report/pipeline.js';
import { createLogger } from '../src/util/logger.js';
import type { AnswersMap } from '../src/domain/types.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const content = loadContent(config.dataDir);
  const logger = createLogger('warn');
  const db = openDb(config.databasePath);
  const repo = new Repo(db);
  const flow = new FlowService(repo, content, config, logger);

  const telegramId = 100000 + Math.floor(Math.random() * 899999);
  repo.upsertUser({ telegramId, chatId: telegramId, firstName: 'نمایشی' });
  const session = flow.createSession(telegramId);
  flow.grantConsent(session);

  const fill = (questions: Array<{ code: string }>, value: (i: number) => number): AnswersMap => {
    const answers: AnswersMap = {};
    questions.forEach((q, i) => {
      answers[q.code] = {
        questionCode: q.code,
        value: value(i),
        answeredAt: new Date().toISOString(),
        elapsedMs: 7000 + ((i * 1300) % 7000),
      };
    });
    return answers;
  };

  const screeningAnswers = fill(content.gate.sections.flatMap((s) => s.questions), (i) => 8 - (i % 4));
  const diagnosticsAnswers = fill(content.matrix.sections.flatMap((s) => s.questions), (i) => (i % 6 === 0 ? 3 : i % 3 === 0 ? 6 : 8));

  // یک توضیح نمونه روی گزارهٔ کلیدی حاکمیت
  const finQ = content.matrix.sections.find((s) => s.code === 'governance')!.questions[0]!;
  diagnosticsAnswers[finQ.code] = {
    ...diagnosticsAnswers[finQ.code]!,
    value: 3,
    explanation: 'اگر نباشم کارها می‌خوابد؛ سیستم هنوز به خودم وابسته است و می‌خواهم این را درست کنم.',
  };

  repo.updateSessionProgress(session.id, { gateAnswers: screeningAnswers, matrixAnswers: diagnosticsAnswers });

  const gate = scoreGate({ questionnaire: content.gate, answers: screeningAnswers, config: content.gateScoring });
  const matrix = buildMatrix({
    questionnaire: content.matrix,
    answers: diagnosticsAnswers,
    config: content.matrixScoring,
    generatedAt: new Date().toISOString(),
  });
  repo.updateSessionProgress(session.id, {
    gateResult: gate,
    matrixResult: matrix,
    status: 'diagnostics_done',
  });

  const row = repo.getSession(session.id)!;
  repo.createDocument({
    id: crypto.randomUUID(),
    sessionId: session.id,
    sessionNo: row.session_no,
    telegramId,
    kind: 'form',
    payload: { stage: 'demo', answers: { screening: screeningAnswers, diagnostics: diagnosticsAnswers } },
  });

  const report = repo.createOrResetReport({ id: crypto.randomUUID(), sessionId: session.id, telegramId });
  // برای نمایش کامل مسیر، کلیدهای مدیر را برای همین پرونده روشن می‌کنیم
  const deep = process.env['SEED_DEEP'] !== 'false';
  const reserved = repo.createDocument({
    id: crypto.randomUUID(),
    sessionId: session.id,
    sessionNo: row.session_no,
    telegramId,
    kind: 'report',
    payload: { stage: 'reserved' },
  });
  const result = await generateReport({
    config,
    content,
    llm: new MockLlmProvider(content.actions),
    data: {
      reportId: report.id,
      sessionId: session.id,
      sessionNo: row.session_no,
      serial: reserved.serial,
      generatedAt: new Date(),
      matrix,
      matrixAnswers: diagnosticsAnswers,
      gateAnswers: screeningAnswers,
      gateResult: gate,
      deepInterpretation: deep,
      aiInterpretation: deep,
    },
  });
  repo.saveInterpretation(report.id, result.interpretation, result.htmlPath, result.contentHash);
  repo.updateSessionProgress(session.id, { status: 'report_ready', completedAt: new Date().toISOString() });

  const explanations = collectExplanations(matrix, diagnosticsAnswers, content.matrix, 40);
  void explanations;
  void toMatrixBundle;

  process.stdout.write(
    [
      '✅ پروندهٔ نمایشی ساخته شد',
      `   نشست: شمارهٔ ${row.session_no} · شناسه ${session.id}`,
      `   لیبل ارزیابی (فقط داخلی): ${gate.zone} — ${gate.score0to100} (سقف: ${gate.criticalCeiling?.ceiling ?? 'none'})`,
      `   عارضه‌یابی: ${matrix.overall0to100} (${matrix.band}) · گلوگاه ${matrix.bottleneck.title} (${matrix.bottleneck.score0to100})`,
      `   عارضه‌ها: ${matrix.symptoms.length} · توضیحات: ${matrix.explanationsCount}`,
      `   تفسیر: ${result.tier} · بازبینی انسانی: ${result.awaitingHumanReview ? 'بله' : 'خیر'}`,
      `   شناسهٔ گزارش: ${report.id}`,
      `   فایل: ${result.htmlPath}`,
      '',
      `   لینک محلی (پس از اجرای سرور): http://localhost:${config.httpPort}/reports/${report.id}`,
    ].join('\n') + '\n',
  );
  db.close();
}

void main();
