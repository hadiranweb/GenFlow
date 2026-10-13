/**
 * موتور جریان گفت‌وگو (state machine) — مطابق فرایند اصلی.
 *
 * تغییرهای کلیدی نسبت به نسخهٔ قبل:
 *  ۱) **هیچ مسدودسازی‌ای وجود ندارد.** ارزیابی اولیه یک «لیبل» است (برای پرونده) و
 *     خروجی‌اش به کاربر نمایش داده نمی‌شود؛ مسیر همیشه ادامه پیدا می‌کند.
 *  ۲) **گذار بی‌وقفه:** پس از آخرین پرسش ارزیابی، بلافاصله پرسش اول عارضه‌یابی
 *     نمایش داده می‌شود؛ شمارندهٔ پیشرفت پیوسته است (۱..۶۹).
 *  ۳) **دو ساید بودن پرسش‌های عارضه‌یابی:** پس از پاسخ رنجی می‌توان (اختیاری) توضیح
 *     متنی هم ثبت کرد؛ توضیح وارد محاسبه نمی‌شود و فقط برای تفسیر می‌ماند.
 *  ۴) **آرشیو سریال‌دار:** فرم تکمیل‌شده، ماتریس، تفسیر و سند — همه با شماره سری.
 *
 * نکتهٔ idempotency: کلیک‌های کهنه (ایندکس نامطابق با cursor) نادیده گرفته می‌شوند.
 */
import type { InlineKeyboard } from 'grammy';
import type { AppConfig } from '../config.js';
import type { ContentBundle } from '../domain/content.js';
import { buildMatrix } from '../domain/matrix.js';
import { scoreGate } from '../domain/scoring.js';
import type {
  AnswersMap,
  GateScoreResult,
  MatrixResult,
  QuestionDef,
  QuestionnaireDef,
  SessionStatus,
} from '../domain/types.js';
import type { Logger } from '../util/logger.js';
import type { Repo, SessionRow } from '../storage/repo.js';
import { renderQuestion } from './messages.js';

export type FlowKey = 'screening' | 'diagnostics';

export interface PromptView {
  sessionId: string;
  flow: FlowKey;
  index: number;
  /** شمارهٔ پیوستهٔ پرسش (۱..total) برای نمایش */
  displayIndex: number;
  total: number;
  question: QuestionDef;
  text: string;
  keyboard: InlineKeyboard;
  awaitingExplanation: boolean;
}

export type AnswerOutcome =
  | { kind: 'advanced'; view: PromptView }
  | { kind: 'screening_completed'; gate: GateScoreResult; nextView: PromptView }
  | { kind: 'diagnostics_completed'; matrix: MatrixResult; reportId: string }
  | { kind: 'stale' }
  | { kind: 'not_active' }
  | { kind: 'invalid_value' };

export class FlowService {
  /** زمان نمایش پرسش جاری (برای گارد «پاسخ شتاب‌زده») — فقط در حافظه */
  private readonly promptSentAt = new Map<string, number>();
  /** جلسه‌هایی که منتظر توضیح متنی برای پرسش جاری‌اند — وضعیت گذرای رابط */
  private readonly awaitingExplanation = new Set<string>();

  constructor(
    private readonly repo: Repo,
    private readonly content: ContentBundle,
    private readonly config: AppConfig,
    private readonly logger: Logger,
  ) {}

  // ---------------------------------------------------------------- helpers
  private questionnaire(key: FlowKey): QuestionnaireDef {
    return key === 'screening' ? this.content.gate : this.content.matrix;
  }

  private questions(key: FlowKey): QuestionDef[] {
    return this.questionnaire(key).sections.flatMap((s) => s.questions);
  }

  get screeningCount(): number {
    return this.questions('screening').length;
  }

  get diagnosticsCount(): number {
    return this.questions('diagnostics').length;
  }

  get combinedTotal(): number {
    return this.screeningCount + this.diagnosticsCount;
  }

  private buildView(session: SessionRow, flow: FlowKey, index: number, intro = false): PromptView {
    const q = this.questionnaire(flow);
    const offset = flow === 'diagnostics' ? this.screeningCount : 0;
    const { text, keyboard } = renderQuestion(q, index, this.combinedTotal, offset, {
      ...(intro ? { intro: true } : {}),
      awaitingExplanation: this.awaitingExplanation.has(session.id),
      explanationAllowed: !this.content.matrixScoring.interpretation.explanationRequired || flow === 'diagnostics',
    });
    const question = this.questions(flow)[index];
    if (!question) throw new Error(`پرسش ${index} در ${flow} وجود ندارد`);
    return {
      sessionId: session.id,
      flow,
      index,
      displayIndex: offset + index + 1,
      total: this.combinedTotal,
      question,
      text,
      keyboard,
      awaitingExplanation: this.awaitingExplanation.has(session.id),
    };
  }

  viewForIndex(session: SessionRow, flow: FlowKey, index: number, intro = false): PromptView {
    return this.buildView(session, flow, index, intro);
  }

  currentView(session: SessionRow): PromptView | null {
    if (session.status === 'screening_in_progress') {
      return this.buildView(session, 'screening', session.gate_cursor);
    }
    if (session.status === 'diagnostics_in_progress') {
      return this.buildView(session, 'diagnostics', session.matrix_cursor);
    }
    return null;
  }

  isAwaitingExplanation(sessionId: string): boolean {
    return this.awaitingExplanation.has(sessionId);
  }

  markPromptSent(sessionId: string): void {
    this.promptSentAt.set(sessionId, Date.now());
  }

  private takeElapsed(sessionId: string): number {
    const sentAt = this.promptSentAt.get(sessionId);
    this.promptSentAt.delete(sessionId);
    if (!sentAt) return 0;
    return Math.max(0, Date.now() - sentAt);
  }

  // ------------------------------------------------------------- life cycle
  createSession(telegramId: number): SessionRow {
    const session = this.repo.createSession(crypto.randomUUID(), telegramId);
    this.repo.logEvent({ type: 'session.created', sessionId: session.id, telegramId, payload: { sessionNo: session.session_no } });
    return session;
  }

  grantConsent(session: SessionRow): PromptView {
    this.repo.setConsent(session.telegram_id, true);
    this.repo.updateSessionProgress(session.id, { status: 'screening_in_progress', gateCursor: 0 });
    this.repo.logEvent({ type: 'consent.granted', sessionId: session.id, telegramId: session.telegram_id });
    const updated = this.repo.getSession(session.id)!;
    const view = this.buildView(updated, 'screening', 0, true);
    this.markPromptSent(updated.id);
    return view;
  }

  cancelSession(session: SessionRow): void {
    this.repo.updateSessionProgress(session.id, { status: 'cancelled' });
    this.repo.logEvent({ type: 'session.cancelled', sessionId: session.id, telegramId: session.telegram_id });
    this.awaitingExplanation.delete(session.id);
  }

  previousView(session: SessionRow): PromptView | null {
    if (session.status === 'screening_in_progress' && session.gate_cursor > 0) {
      const index = session.gate_cursor - 1;
      this.repo.updateSessionProgress(session.id, { gateCursor: index });
      this.repo.bumpBehavior(session.id, { backMoves: 1 });
      const updated = this.repo.getSession(session.id)!;
      const view = this.buildView(updated, 'screening', index);
      this.markPromptSent(updated.id);
      return view;
    }
    if (session.status === 'diagnostics_in_progress' && session.matrix_cursor > 0) {
      const index = session.matrix_cursor - 1;
      this.repo.updateSessionProgress(session.id, { matrixCursor: index });
      this.repo.bumpBehavior(session.id, { backMoves: 1 });
      const updated = this.repo.getSession(session.id)!;
      const view = this.buildView(updated, 'diagnostics', index);
      this.markPromptSent(updated.id);
      return view;
    }
    return null;
  }

  resumeView(session: SessionRow): PromptView | null {
    if (session.status === 'consent_pending') return null;
    const view = this.currentView(session);
    if (view) {
      this.markPromptSent(session.id);
      this.repo.bumpBehavior(session.id, { resumes: 1 });
    }
    return view;
  }

  activeSession(telegramId: number): SessionRow | undefined {
    const active: SessionStatus[] = ['consent_pending', 'screening_in_progress', 'diagnostics_in_progress'];
    return this.repo.getLatestSession(telegramId, active);
  }

  // ------------------------------------------------------------ explanation
  /** شروع ثبت توضیح متنی برای پرسش جاری (ساید دوم — اختیاری) */
  beginExplanation(session: SessionRow): PromptView | null {
    const view = this.currentView(session);
    if (!view) return null;
    if (view.flow !== 'diagnostics' || view.question.response !== 'range+text') return null;
    this.awaitingExplanation.add(session.id);
    return this.buildView(session, view.flow, view.index);
  }

  cancelExplanation(session: SessionRow): PromptView | null {
    this.awaitingExplanation.delete(session.id);
    const view = this.currentView(session);
    return view;
  }

  /** ثبت توضیح برای پرسش جاری (بدون تغییر در نمره و بدون جلو بردن پرسش) */
  submitExplanation(session: SessionRow, text: string): PromptView | null {
    const view = this.currentView(session);
    if (!view || view.flow !== 'diagnostics') return null;
    const max = this.content.matrixScoring.interpretation.maxExplanationChars;
    const trimmed = text.trim().slice(0, max);
    if (trimmed === '') return null;

    const state = this.repo.getSessionState(session.id);
    const answers: AnswersMap = { ...(state?.matrixAnswers ?? {}) };
    const code = view.question.code;
    const existing = answers[code];
    answers[code] = {
      questionCode: code,
      value: existing?.value ?? null,
      answeredAt: existing?.answeredAt ?? new Date().toISOString(),
      elapsedMs: existing?.elapsedMs ?? 0,
      explanation: trimmed,
    };
    this.repo.updateSessionProgress(session.id, { matrixAnswers: answers });
    this.awaitingExplanation.delete(session.id);
    this.repo.logEvent({
      type: 'diagnostics.explanation_added',
      sessionId: session.id,
      telegramId: session.telegram_id,
      payload: { questionCode: code, chars: trimmed.length },
    });
    const updated = this.repo.getSession(session.id)!;
    const next = this.buildView(updated, 'diagnostics', view.index);
    this.markPromptSent(updated.id);
    return next;
  }

  // -------------------------------------------------------------- answering
  submitAnswer(session: SessionRow, index: number, value: number | null): AnswerOutcome {
    const elapsedMs = this.takeElapsed(session.id);

    if (session.status === 'screening_in_progress') {
      if (index !== session.gate_cursor) return { kind: 'stale' };
      if (value !== null && (value < this.content.gate.scaleMin || value > this.content.gate.scaleMax)) {
        return { kind: 'invalid_value' };
      }
      return this.recordScreeningAnswer(session, index, value, elapsedMs);
    }
    if (session.status === 'diagnostics_in_progress') {
      if (index !== session.matrix_cursor) return { kind: 'stale' };
      if (value !== null && (value < this.content.matrix.scaleMin || value > this.content.matrix.scaleMax)) {
        return { kind: 'invalid_value' };
      }
      return this.recordDiagnosticsAnswer(session, index, value, elapsedMs);
    }
    return { kind: 'not_active' };
  }

  private recordScreeningAnswer(
    session: SessionRow,
    index: number,
    value: number | null,
    elapsedMs: number,
  ): AnswerOutcome {
    const questions = this.questions('screening');
    const question = questions[index]!;
    const state = this.repo.getSessionState(session.id);
    const answers: AnswersMap = { ...(state?.gateAnswers ?? {}) };
    answers[question.code] = {
      questionCode: question.code,
      value,
      answeredAt: new Date().toISOString(),
      elapsedMs,
    };
    this.repo.bumpBehavior(session.id, { answeredScenarios: 1, totalAnswerSeconds: Math.round(elapsedMs / 1000) });

    const nextIndex = index + 1;
    if (nextIndex < questions.length) {
      this.repo.updateSessionProgress(session.id, { gateAnswers: answers, gateCursor: nextIndex });
      const updated = this.repo.getSession(session.id)!;
      const view = this.buildView(updated, 'screening', nextIndex);
      this.markPromptSent(updated.id);
      return { kind: 'advanced', view };
    }

    // پایان ارزیابی اولیه → محاسبهٔ «لیبل» (بدون LLM، بدون نمایش به کاربر)
    const behaviors = this.repo.getSessionState(session.id)?.behavior;
    const gate = scoreGate({
      questionnaire: this.content.gate,
      answers,
      config: this.content.gateScoring,
      ...(behaviors ? { behaviors } : {}),
    });

    this.repo.updateSessionProgress(session.id, {
      gateAnswers: answers,
      gateCursor: nextIndex,
      gateResult: gate,
      status: 'diagnostics_in_progress',
      matrixCursor: 0,
      matrixAnswers: {},
    });

    // آرشیو سریال‌دار فرم ارزیابی + لیبل (فقط در پرونده/دیتابیس)
    const sessionNow = this.repo.getSession(session.id)!;
    this.repo.createDocument({
      id: crypto.randomUUID(),
      sessionId: session.id,
      sessionNo: sessionNow.session_no,
      telegramId: session.telegram_id,
      kind: 'form',
      contentHash: null,
      payload: {
        stage: 'screening',
        answers,
        label: {
          zone: gate.zone,
          score0to100: gate.score0to100,
          confidence: gate.confidence,
          criticalCeiling: gate.criticalCeiling ?? null,
          guards: gate.guards.filter((g) => g.triggered),
          formulaVersion: gate.formulaVersion,
          weighting: gate.weighting,
          behavior: gate.behavior ?? null,
        },
      },
    });

    this.repo.logEvent({
      type: 'screening.completed',
      sessionId: session.id,
      telegramId: session.telegram_id,
      payload: {
        zone: gate.zone,
        score: gate.score0to100,
        ceiling: gate.criticalCeiling?.ceiling ?? 'none',
        confidence: gate.confidence,
        formulaVersion: gate.formulaVersion,
      },
    });
    this.logger.info('ارزیابی اولیه کامل شد؛ لیبل ثبت شد (فقط سطح مدیریت)', {
      sessionId: session.id,
      zone: gate.zone,
      score: gate.score0to100,
      ceiling: gate.criticalCeiling?.ceiling ?? 'none',
    });

    // ادامهٔ بی‌وقفه: پرسش اول عارضه‌یابی، بدون اعلام مرحله
    const updated = this.repo.getSession(session.id)!;
    const nextView = this.buildView(updated, 'diagnostics', 0, true);
    this.markPromptSent(updated.id);
    return { kind: 'screening_completed', gate, nextView };
  }

  private recordDiagnosticsAnswer(
    session: SessionRow,
    index: number,
    value: number | null,
    elapsedMs: number,
  ): AnswerOutcome {
    const questions = this.questions('diagnostics');
    const question = questions[index]!;
    const state = this.repo.getSessionState(session.id);
    const answers: AnswersMap = { ...(state?.matrixAnswers ?? {}) };
    const existing = answers[question.code];
    answers[question.code] = {
      questionCode: question.code,
      value,
      answeredAt: new Date().toISOString(),
      elapsedMs,
      ...(existing?.explanation ? { explanation: existing.explanation } : {}),
    };
    this.awaitingExplanation.delete(session.id);

    const nextIndex = index + 1;
    if (nextIndex < questions.length) {
      this.repo.updateSessionProgress(session.id, { matrixAnswers: answers, matrixCursor: nextIndex });
      const updated = this.repo.getSession(session.id)!;
      const view = this.buildView(updated, 'diagnostics', nextIndex);
      this.markPromptSent(updated.id);
      return { kind: 'advanced', view };
    }

    // پایان عارضه‌یابی → ماتریس قطعی
    const matrix = buildMatrix({
      questionnaire: this.content.matrix,
      answers,
      config: this.content.matrixScoring,
      generatedAt: new Date().toISOString(),
    });
    this.repo.updateSessionProgress(session.id, {
      matrixAnswers: answers,
      matrixCursor: nextIndex,
      matrixResult: matrix,
      status: 'diagnostics_done',
    });

    const sessionNow = this.repo.getSession(session.id)!;
    this.repo.createDocument({
      id: crypto.randomUUID(),
      sessionId: session.id,
      sessionNo: sessionNow.session_no,
      telegramId: session.telegram_id,
      kind: 'form',
      contentHash: null,
      payload: {
        stage: 'diagnostics',
        answers,
        explanationsCount: matrix.explanationsCount,
      },
    });
    this.repo.createDocument({
      id: crypto.randomUUID(),
      sessionId: session.id,
      sessionNo: sessionNow.session_no,
      telegramId: session.telegram_id,
      kind: 'range_matrix',
      contentHash: null,
      payload: matrix,
    });

    const report = this.repo.createOrResetReport({
      id: crypto.randomUUID(),
      sessionId: session.id,
      telegramId: session.telegram_id,
    });

    this.repo.logEvent({
      type: 'diagnostics.completed',
      sessionId: session.id,
      telegramId: session.telegram_id,
      payload: {
        overall: matrix.overall0to100,
        band: matrix.band,
        bottleneck: matrix.bottleneck.code,
        symptoms: matrix.symptoms.length,
        explanations: matrix.explanationsCount,
        reportId: report.id,
      },
    });

    return { kind: 'diagnostics_completed', matrix, reportId: report.id };
  }
}
