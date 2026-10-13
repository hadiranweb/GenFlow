/**
 * واسط دسترسی به داده (Repository).
 * همهٔ SQL اینجاست؛ بقیهٔ کد فقط با نوع‌های دامنه کار می‌کند.
 */
import type { Db } from './db.js';
import type { AnswersMap, BehaviorStats, GateScoreResult, Interpretation, MatrixResult, SessionStatus } from '../domain/types.js';
import { nowIso } from '../util/time.js';

export interface UserRow {
  telegram_id: number;
  chat_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  consent_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SessionRow {
  id: string;
  telegram_id: number;
  status: SessionStatus;
  gate_cursor: number;
  matrix_cursor: number;
  gate_answers: string;
  matrix_answers: string;
  gate_result: string | null;
  matrix_result: string | null;
  behavior_json: string;
  session_no: number;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ReportRow {
  id: string;
  session_id: string;
  telegram_id: number;
  status: 'pending' | 'generating' | 'ready' | 'failed';
  attempts: number;
  llm_provider: string | null;
  llm_model: string | null;
  llm_status: string | null;
  interpretation: string | null;
  html_path: string | null;
  content_hash: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentKind = 'form' | 'range_matrix' | 'interpretation' | 'report';

export interface DocumentRow {
  serial: number;
  id: string;
  session_id: string;
  session_no: number;
  telegram_id: number;
  kind: DocumentKind;
  content_hash: string | null;
  payload: string;
  created_at: string;
}

export interface SessionState {
  row: SessionRow;
  gateAnswers: AnswersMap;
  matrixAnswers: AnswersMap;
  gateResult: GateScoreResult | null;
  matrixResult: MatrixResult | null;
  behavior: BehaviorStats;
}

export const EMPTY_BEHAVIOR: BehaviorStats = {
  invalidAttempts: 0,
  backMoves: 0,
  resumes: 0,
  helpViews: 0,
  totalAnswerSeconds: 0,
  answeredScenarios: 0,
};

function parseAnswers(json: string): AnswersMap {
  try {
    return JSON.parse(json) as AnswersMap;
  } catch {
    return {};
  }
}

export class Repo {
  constructor(private readonly db: Db) {}

  // ---------------------------------------------------------------- users ---
  upsertUser(input: {
    telegramId: number;
    chatId: number;
    username?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
  }): void {
    const now = nowIso();
    this.db.raw
      .prepare(
        `INSERT INTO users (telegram_id, chat_id, username, first_name, last_name, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(telegram_id) DO UPDATE SET
           chat_id = excluded.chat_id,
           username = excluded.username,
           first_name = excluded.first_name,
           last_name = excluded.last_name,
           updated_at = excluded.updated_at`,
      )
      .run(
        input.telegramId,
        input.chatId,
        input.username ?? null,
        input.firstName ?? null,
        input.lastName ?? null,
        now,
        now,
      );
  }

  getUser(telegramId: number): UserRow | undefined {
    return this.db.raw.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId) as UserRow | undefined;
  }

  setConsent(telegramId: number, consent: boolean): void {
    this.db.raw
      .prepare('UPDATE users SET consent_at = ?, updated_at = ? WHERE telegram_id = ?')
      .run(consent ? nowIso() : null, nowIso(), telegramId);
  }

  /** حذف دادهٔ کاربر بر اساس درخواست خودش (حفظ حق حذف داده) */
  purgeUser(telegramId: number): { sessions: number; reports: number; documents: number } {
    const sessions = this.db.raw.prepare('SELECT COUNT(*) AS c FROM sessions WHERE telegram_id = ?').get(telegramId) as { c: number };
    const reports = this.db.raw.prepare('SELECT COUNT(*) AS c FROM reports WHERE telegram_id = ?').get(telegramId) as { c: number };
    const documents = this.db.raw.prepare('SELECT COUNT(*) AS c FROM documents WHERE telegram_id = ?').get(telegramId) as { c: number };
    this.db.raw.prepare('DELETE FROM reports WHERE telegram_id = ?').run(telegramId);
    this.db.raw.prepare('DELETE FROM documents WHERE telegram_id = ?').run(telegramId);
    this.db.raw.prepare('DELETE FROM sessions WHERE telegram_id = ?').run(telegramId);
    this.db.raw
      .prepare('UPDATE users SET deleted_at = ?, username = NULL, first_name = NULL, last_name = NULL WHERE telegram_id = ?')
      .run(nowIso(), telegramId);
    this.db.raw.prepare('DELETE FROM events WHERE telegram_id = ?').run(telegramId);
    return { sessions: sessions.c, reports: reports.c, documents: documents.c };
  }

  // ------------------------------------------------------------- sessions ---
  createSession(id: string, telegramId: number): SessionRow {
    const now = nowIso();
    // شمارهٔ نشست این کاربر (۱، ۲، ۳ …) — مطابق «نشست شماره x» در دیاگرام
    const sessionNo = this.countSessions(telegramId) + 1;
    this.db.raw
      .prepare(
        `INSERT INTO sessions (id, telegram_id, status, session_no, started_at, updated_at)
         VALUES (?, ?, 'consent_pending', ?, ?, ?)`,
      )
      .run(id, telegramId, sessionNo, now, now);
    const row = this.getSession(id);
    if (!row) throw new Error('ساخت جلسه ناموفق بود');
    return row;
  }

  getSession(id: string): SessionRow | undefined {
    return this.db.raw.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined;
  }

  getSessionState(id: string): SessionState | undefined {
    const row = this.getSession(id);
    if (!row) return undefined;
    return {
      row,
      gateAnswers: parseAnswers(row.gate_answers),
      matrixAnswers: parseAnswers(row.matrix_answers),
      gateResult: row.gate_result ? (JSON.parse(row.gate_result) as GateScoreResult) : null,
      matrixResult: row.matrix_result ? (JSON.parse(row.matrix_result) as MatrixResult) : null,
      behavior: row.behavior_json
        ? { ...EMPTY_BEHAVIOR, ...(JSON.parse(row.behavior_json) as Partial<BehaviorStats>) }
        : { ...EMPTY_BEHAVIOR },
    };
  }

  /** آخرین جلسهٔ ناتمام کاربر (برای /resume) */
  getLatestSession(telegramId: number, statuses: SessionStatus[]): SessionRow | undefined {
    const placeholders = statuses.map(() => '?').join(',');
    return this.db.raw
      .prepare(
        `SELECT * FROM sessions WHERE telegram_id = ? AND status IN (${placeholders})
         ORDER BY started_at DESC LIMIT 1`,
      )
      .get(telegramId, ...statuses) as SessionRow | undefined;
  }

  updateSessionProgress(
    id: string,
    patch: {
      status?: SessionStatus;
      gateCursor?: number;
      matrixCursor?: number;
      gateAnswers?: AnswersMap;
      matrixAnswers?: AnswersMap;
      gateResult?: GateScoreResult | null;
      matrixResult?: MatrixResult | null;
      behavior?: BehaviorStats;
      completedAt?: string | null;
    },
  ): void {
    const fields: string[] = ['updated_at = ?'];
    const values: Array<string | number | null> = [nowIso()];
    if (patch.status !== undefined) {
      fields.push('status = ?');
      values.push(patch.status);
    }
    if (patch.gateCursor !== undefined) {
      fields.push('gate_cursor = ?');
      values.push(patch.gateCursor);
    }
    if (patch.matrixCursor !== undefined) {
      fields.push('matrix_cursor = ?');
      values.push(patch.matrixCursor);
    }
    if (patch.gateAnswers !== undefined) {
      fields.push('gate_answers = ?');
      values.push(JSON.stringify(patch.gateAnswers));
    }
    if (patch.matrixAnswers !== undefined) {
      fields.push('matrix_answers = ?');
      values.push(JSON.stringify(patch.matrixAnswers));
    }
    if (patch.gateResult !== undefined) {
      fields.push('gate_result = ?');
      values.push(patch.gateResult === null ? null : JSON.stringify(patch.gateResult));
    }
    if (patch.matrixResult !== undefined) {
      fields.push('matrix_result = ?');
      values.push(patch.matrixResult === null ? null : JSON.stringify(patch.matrixResult));
    }
    if (patch.behavior !== undefined) {
      fields.push('behavior_json = ?');
      values.push(JSON.stringify(patch.behavior));
    }
    if (patch.completedAt !== undefined) {
      fields.push('completed_at = ?');
      values.push(patch.completedAt);
    }
    values.push(id);
    this.db.raw.prepare(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  /** شمارندهٔ رفتار را اتمی به‌روز می‌کند (increment) */
  bumpBehavior(sessionId: string, delta: Partial<BehaviorStats>): BehaviorStats {
    const state = this.getSessionState(sessionId);
    const current = state?.behavior ?? { ...EMPTY_BEHAVIOR };
    const next: BehaviorStats = {
      invalidAttempts: current.invalidAttempts + (delta.invalidAttempts ?? 0),
      backMoves: current.backMoves + (delta.backMoves ?? 0),
      resumes: current.resumes + (delta.resumes ?? 0),
      helpViews: current.helpViews + (delta.helpViews ?? 0),
      totalAnswerSeconds: current.totalAnswerSeconds + (delta.totalAnswerSeconds ?? 0),
      answeredScenarios: current.answeredScenarios + (delta.answeredScenarios ?? 0),
    };
    this.db.raw
      .prepare('UPDATE sessions SET behavior_json = ?, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(next), nowIso(), sessionId);
    return next;
  }

  countSessions(telegramId: number): number {
    const r = this.db.raw.prepare('SELECT COUNT(*) AS c FROM sessions WHERE telegram_id = ?').get(telegramId) as { c: number };
    return r.c;
  }

  listSessions(telegramId: number, limit = 10): SessionRow[] {
    return this.db.raw
      .prepare('SELECT * FROM sessions WHERE telegram_id = ? ORDER BY started_at DESC LIMIT ?')
      .all(telegramId, limit) as unknown as SessionRow[];
  }

  // -------------------------------------------------------------- reports ---
  createOrResetReport(input: { id: string; sessionId: string; telegramId: number }): ReportRow {
    const now = nowIso();
    this.db.raw
      .prepare(
        `INSERT INTO reports (id, session_id, telegram_id, status, attempts, created_at, updated_at)
         VALUES (?, ?, ?, 'pending', 0, ?, ?)
         ON CONFLICT(session_id) DO UPDATE SET
           status = 'pending', error = NULL, attempts = reports.attempts + 1, updated_at = excluded.updated_at`,
      )
      .run(input.id, input.sessionId, input.telegramId, now, now);
    const row = this.getReportBySession(input.sessionId);
    if (!row) throw new Error('ساخت گزارش ناموفق بود');
    return row;
  }

  getReport(id: string): ReportRow | undefined {
    return this.db.raw.prepare('SELECT * FROM reports WHERE id = ?').get(id) as ReportRow | undefined;
  }

  getReportBySession(sessionId: string): ReportRow | undefined {
    return this.db.raw.prepare('SELECT * FROM reports WHERE session_id = ?').get(sessionId) as ReportRow | undefined;
  }

  getLatestReport(telegramId: number): ReportRow | undefined {
    return this.db.raw
      .prepare('SELECT * FROM reports WHERE telegram_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(telegramId) as ReportRow | undefined;
  }

  setReportStatus(
    id: string,
    status: ReportRow['status'],
    patch: Partial<Pick<ReportRow, 'llm_provider' | 'llm_model' | 'llm_status' | 'interpretation' | 'html_path' | 'content_hash' | 'error'>> = {},
  ): void {
    const fields: string[] = ['status = ?', 'updated_at = ?'];
    const values: Array<string | number | null> = [status, nowIso()];
    for (const [k, v] of Object.entries(patch)) {
      fields.push(`${k} = ?`);
      values.push(v as string | null);
    }
    values.push(id);
    this.db.raw.prepare(`UPDATE reports SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  saveInterpretation(id: string, interpretation: Interpretation, htmlPath: string, contentHash: string): void {
    this.setReportStatus(id, 'ready', {
      llm_provider: interpretation.meta.provider,
      llm_model: interpretation.meta.model,
      llm_status: interpretation.meta.status,
      interpretation: JSON.stringify(interpretation),
      html_path: htmlPath,
      content_hash: contentHash,
      error: null,
    });
  }

  // ------------------------------------------------------------ documents ---
  /**
   * ثبت یک سند در آرشیو سریال‌دار (فقط-افزودنی).
   * serial سراسری و یکنواست و توسط خود SQLite تعیین می‌شود.
   */
  createDocument(input: {
    id: string;
    sessionId: string;
    sessionNo: number;
    telegramId: number;
    kind: DocumentKind;
    contentHash?: string | null;
    payload?: unknown;
  }): DocumentRow {
    this.db.raw
      .prepare(
        `INSERT INTO documents (id, session_id, session_no, telegram_id, kind, content_hash, payload, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.id,
        input.sessionId,
        input.sessionNo,
        input.telegramId,
        input.kind,
        input.contentHash ?? null,
        JSON.stringify(input.payload ?? {}),
        nowIso(),
      );
    const row = this.db.raw
      .prepare('SELECT * FROM documents WHERE id = ?')
      .get(input.id) as DocumentRow | undefined;
    if (!row) throw new Error('ثبت سند ناموفق بود');
    return row;
  }

  listDocuments(sessionId: string): DocumentRow[] {
    return this.db.raw
      .prepare('SELECT * FROM documents WHERE session_id = ? ORDER BY serial ASC')
      .all(sessionId) as unknown as DocumentRow[];
  }

  countDocuments(telegramId: number): number {
    const r = this.db.raw
      .prepare('SELECT COUNT(*) AS c FROM documents WHERE telegram_id = ?')
      .get(telegramId) as { c: number };
    return r.c;
  }

  // --------------------------------------------------------------- settings ---
  getSetting(key: string): string | undefined {
    const row = this.db.raw.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
      | { value: string }
      | undefined;
    return row?.value;
  }

  getBoolSetting(key: string, fallback: boolean): boolean {
    const v = this.getSetting(key);
    if (v === undefined) return fallback;
    return v === 'true' || v === '1';
  }

  /** فقط اگر کلید وجود نداشت مقدار اولیه را می‌نویسد (بدون بازنویسی تنظیم مدیر) */
  setSettingIfMissing(key: string, value: string): void {
    if (this.getSetting(key) === undefined) this.setSetting(key, value);
  }

  setSetting(key: string, value: string): void {
    this.db.raw
      .prepare(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      )
      .run(key, value, nowIso());
  }

  allSettings(): Array<{ key: string; value: string; updatedAt: string }> {
    const rows = this.db.raw
      .prepare('SELECT key, value, updated_at FROM settings ORDER BY key')
      .all() as unknown as Array<{ key: string; value: string; updated_at: string }>;
    return rows.map((r) => ({ key: r.key, value: r.value, updatedAt: r.updated_at }));
  }

  // --------------------------------------------------------------- events ---
  logEvent(input: { type: string; sessionId?: string | undefined; telegramId?: number | undefined; payload?: unknown }): void {
    this.db.raw
      .prepare('INSERT INTO events (session_id, telegram_id, type, payload, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(
        input.sessionId ?? null,
        input.telegramId ?? null,
        input.type,
        JSON.stringify(input.payload ?? {}),
        nowIso(),
      );
  }

  countEvents(type: string): number {
    const r = this.db.raw.prepare('SELECT COUNT(*) AS c FROM events WHERE type = ?').get(type) as { c: number };
    return r.c;
  }
}
