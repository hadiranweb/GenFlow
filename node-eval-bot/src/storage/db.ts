/**
 * لایهٔ ذخیره‌سازی — SQLite داخلی Node (`node:sqlite`).
 * بدون وابستگی native؛ فایل واحد؛ مناسب MVP و بار متوسط چند هزار کاربر.
 * برای مقیاس بزرگ‌تر، همین واسط با PostgreSQL قابل جایگزینی است.
 *
 * در صورت نیاز به مهاجرت: جدول‌ها با IF NOT EXISTS ساخته می‌شوند و هر تغییر
 * ساختاری باید به شکل مهاجرت نسخه‌دار (جدول schema_migrations) اضافه شود.
 */
import { createRequire } from 'node:module';
import type * as NodeSqlite from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

/**
 * `node:sqlite` از طریق createRequire بارگذاری می‌شود تا ابزارهای باندل‌کننده
 * (Vite/Vitest) آن را به‌عنوان ماژول بیرونی بشناسند و تلاش نکنند resolve کنند.
 */
const nodeRequire = createRequire(import.meta.url);
const sqlite = nodeRequire('node:sqlite') as typeof NodeSqlite;

export interface Db {
  raw: NodeSqlite.DatabaseSync;
  close(): void;
}

const MIGRATIONS: Array<{ id: string; sql: string }> = [
  {
    id: '001_init',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        telegram_id      INTEGER PRIMARY KEY,
        chat_id          INTEGER NOT NULL,
        username         TEXT,
        first_name       TEXT,
        last_name        TEXT,
        consent_at       TEXT,
        created_at       TEXT NOT NULL,
        updated_at       TEXT NOT NULL,
        deleted_at       TEXT
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id               TEXT PRIMARY KEY,
        telegram_id      INTEGER NOT NULL,
        status           TEXT NOT NULL,
        gate_cursor      INTEGER NOT NULL DEFAULT 0,
        matrix_cursor    INTEGER NOT NULL DEFAULT 0,
        gate_answers     TEXT NOT NULL DEFAULT '{}',
        matrix_answers   TEXT NOT NULL DEFAULT '{}',
        gate_result      TEXT,
        matrix_result    TEXT,
        started_at       TEXT NOT NULL,
        updated_at       TEXT NOT NULL,
        completed_at     TEXT,
        FOREIGN KEY (telegram_id) REFERENCES users(telegram_id)
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(telegram_id, started_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

      CREATE TABLE IF NOT EXISTS reports (
        id               TEXT PRIMARY KEY,
        session_id       TEXT NOT NULL,
        telegram_id      INTEGER NOT NULL,
        status           TEXT NOT NULL,
        attempts         INTEGER NOT NULL DEFAULT 0,
        llm_provider     TEXT,
        llm_model        TEXT,
        llm_status       TEXT,
        interpretation   TEXT,
        html_path        TEXT,
        content_hash     TEXT,
        error            TEXT,
        created_at       TEXT NOT NULL,
        updated_at       TEXT NOT NULL,
        UNIQUE (session_id)
      );
      CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(telegram_id, created_at DESC);

      -- رویدادنگار فقط-افزودنی (audit trail): چه کسی، کِی، چه مرحله‌ای را طی کرد
      CREATE TABLE IF NOT EXISTS events (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id       TEXT,
        telegram_id      INTEGER,
        type             TEXT NOT NULL,
        payload          TEXT NOT NULL DEFAULT '{}',
        created_at       TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id, id);
    `,
  },
  {
    // شمارنده‌های رفتار ورودی (مشاهده‌شده در خود فرم) — برای سنجهٔ «فاعلیت» دیاگرام
    id: '002_session_behavior',
    sql: `
      ALTER TABLE sessions ADD COLUMN behavior_json TEXT NOT NULL DEFAULT '{}';
    `,
  },
  {
    // آرشیو سریال‌دار (طبق دیاگرام: «فرم پرشده ... شماره سری می‌گیرد») + شمارهٔ نشست + کلیدهای مدیر
    id: '003_archive_and_settings',
    sql: `
      ALTER TABLE sessions ADD COLUMN session_no INTEGER NOT NULL DEFAULT 1;

      CREATE TABLE IF NOT EXISTS documents (
        serial        INTEGER PRIMARY KEY AUTOINCREMENT,   -- شماره سری سراسری
        id            TEXT NOT NULL UNIQUE,
        session_id    TEXT NOT NULL,
        session_no    INTEGER NOT NULL DEFAULT 1,
        telegram_id   INTEGER NOT NULL,
        kind          TEXT NOT NULL,                       -- form | range_matrix | interpretation | report
        content_hash  TEXT,
        payload       TEXT NOT NULL DEFAULT '{}',
        created_at    TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_documents_session ON documents(session_id, kind);
      CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(telegram_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS settings (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  },
];

export function openDb(databasePath: string): Db {
  mkdirSync(path.dirname(databasePath), { recursive: true });
  const raw = new sqlite.DatabaseSync(databasePath);
  // PRAGMA باید بیرون از تراکنش اجرا شود.
  raw.exec('PRAGMA foreign_keys = ON;');
  if (databasePath !== ':memory:') raw.exec('PRAGMA journal_mode = WAL;');
  raw.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL);`);

  const applied = new Set(
    (raw.prepare('SELECT id FROM schema_migrations').all() as Array<{ id: string }>).map((r) => r.id),
  );

  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    raw.exec('BEGIN');
    try {
      raw.exec(m.sql);
      raw
        .prepare('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)')
        .run(m.id, new Date().toISOString());
      raw.exec('COMMIT');
    } catch (err) {
      raw.exec('ROLLBACK');
      throw new Error(`مهاجرت ${m.id} ناموفق بود: ${(err as Error).message}`);
    }
  }

  return {
    raw,
    close: () => raw.close(),
  };
}
