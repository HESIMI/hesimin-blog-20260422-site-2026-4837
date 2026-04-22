import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { Pool } from "pg";
import { DEFAULT_TAG_NAMES } from "@/lib/default-tags";

export type TagRecord = {
  id: number;
  name: string;
  count: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MessageType = "SUGGESTION" | "WHISPER";

export type MessageRecord = {
  id: number;
  type: MessageType;
  content: string;
  isAnonymous: boolean;
  isRead: boolean;
  createdAt: string;
};

const postgresUrl = process.env.DATABASE_URL?.trim();
const usePostgres = Boolean(postgresUrl);

const dbPath =
  process.env.SQLITE_DB_PATH?.trim() || path.join(process.cwd(), "data", "personal-blog.db");

let sqliteDb: Database.Database | null = null;
if (!usePostgres) {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sqliteDb = new Database(dbPath);
  sqliteDb.pragma("journal_mode = WAL");
}

const shouldUseSsl =
  process.env.DATABASE_SSL === "true" || (postgresUrl ? postgresUrl.includes("supabase.co") : false);

const pgPool = usePostgres
  ? new Pool({
      connectionString: postgresUrl,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
    })
  : null;

let initialized = false;
let initPromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (initialized) return;
  if (!initPromise) {
    initPromise = usePostgres ? initializePostgres() : Promise.resolve(initializeSqlite());
  }
  await initPromise;
  initialized = true;
}

function initializeSqlite() {
  if (!sqliteDb) return;

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      count INTEGER NOT NULL DEFAULT 0,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS tags_updated_at_trigger
    AFTER UPDATE ON tags
    FOR EACH ROW
    BEGIN
      UPDATE tags SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('SUGGESTION', 'WHISPER')),
      content TEXT NOT NULL,
      is_anonymous INTEGER NOT NULL DEFAULT 1,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const messageColumns = sqliteDb.prepare("PRAGMA table_info(messages)").all() as Array<{ name: string }>;
  if (!messageColumns.some((column) => column.name === "is_read")) {
    sqliteDb.exec("ALTER TABLE messages ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0");
  }

  const insertDefaultTagStmt = sqliteDb.prepare(`
    INSERT OR IGNORE INTO tags (name, count, is_default)
    VALUES (?, 0, 1)
  `);
  for (const tagName of DEFAULT_TAG_NAMES) {
    insertDefaultTagStmt.run(tagName);
  }
}

async function initializePostgres() {
  if (!pgPool) return;

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      count INTEGER NOT NULL DEFAULT 0,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('SUGGESTION', 'WHISPER')),
      content TEXT NOT NULL,
      is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pgPool.query(`
    ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  await pgPool.query(`
    ALTER TABLE tags
    ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  for (const tagName of DEFAULT_TAG_NAMES) {
    await pgPool.query(
      `
        INSERT INTO tags (name, count, is_default)
        VALUES ($1, 0, TRUE)
        ON CONFLICT (name) DO NOTHING
      `,
      [tagName],
    );
  }
}

export async function getAllTags(): Promise<TagRecord[]> {
  await ensureInitialized();

  if (usePostgres && pgPool) {
    const result = await pgPool.query<{
      id: number;
      name: string;
      count: number;
      is_default: boolean;
      created_at: string;
      updated_at: string;
    }>(`
      SELECT id, name, count, is_default, created_at, updated_at
      FROM tags
      ORDER BY count DESC, created_at ASC
    `);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      count: row.count,
      isDefault: row.is_default,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  if (!sqliteDb) return [];
  const rows = sqliteDb.prepare(`
    SELECT id, name, count, is_default, created_at, updated_at
    FROM tags
    ORDER BY count DESC, created_at ASC
  `).all() as Array<{
    id: number;
    name: string;
    count: number;
    is_default: number;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    count: row.count,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function incrementTag(name: string, isDefault: boolean) {
  await ensureInitialized();

  if (usePostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `
          INSERT INTO tags (name, count, is_default)
          VALUES ($1, 0, $2)
          ON CONFLICT (name) DO NOTHING
        `,
        [name, isDefault],
      );
      await client.query(
        `
          UPDATE tags
          SET count = count + 1, updated_at = NOW()
          WHERE name = $1
        `,
        [name],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    return;
  }

  if (!sqliteDb) return;
  const incrementTagTxn = sqliteDb.transaction((tagName: string, defaultFlag: number) => {
    sqliteDb?.prepare(
      `
        INSERT OR IGNORE INTO tags (name, count, is_default)
        VALUES (?, 0, ?)
      `,
    ).run(tagName, defaultFlag);

    sqliteDb?.prepare(
      `
        UPDATE tags
        SET count = count + 1
        WHERE name = ?
      `,
    ).run(tagName);
  });
  incrementTagTxn(name, isDefault ? 1 : 0);
}

export async function addMessage(type: MessageType, content: string, isAnonymous: boolean) {
  await ensureInitialized();

  if (usePostgres && pgPool) {
    const result = await pgPool.query<{ id: number }>(
      `
        INSERT INTO messages (type, content, is_anonymous)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [type, content, isAnonymous],
    );
    return result.rows[0]?.id ?? 0;
  }

  if (!sqliteDb) return 0;
  const result = sqliteDb
    .prepare(
      `
        INSERT INTO messages (type, content, is_anonymous)
        VALUES (?, ?, ?)
      `,
    )
    .run(type, content, isAnonymous ? 1 : 0);
  return Number(result.lastInsertRowid);
}

export async function getAllMessages(): Promise<MessageRecord[]> {
  await ensureInitialized();

  if (usePostgres && pgPool) {
    const result = await pgPool.query<{
      id: number;
      type: MessageType;
      content: string;
      is_anonymous: boolean;
      is_read: boolean;
      created_at: string;
    }>(`
      SELECT id, type, content, is_anonymous, is_read, created_at
      FROM messages
      ORDER BY created_at DESC, id DESC
    `);

    return result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      content: row.content,
      isAnonymous: row.is_anonymous,
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
  }

  if (!sqliteDb) return [];
  const rows = sqliteDb.prepare(`
    SELECT id, type, content, is_anonymous, is_read, created_at
    FROM messages
    ORDER BY created_at DESC, id DESC
  `).all() as Array<{
    id: number;
    type: MessageType;
    content: string;
    is_anonymous: number;
    is_read: number;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    content: row.content,
    isAnonymous: row.is_anonymous === 1,
    isRead: row.is_read === 1,
    createdAt: row.created_at,
  }));
}

export async function deleteTagById(id: number) {
  await ensureInitialized();

  if (usePostgres && pgPool) {
    const result = await pgPool.query("DELETE FROM tags WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  if (!sqliteDb) return false;
  const result = sqliteDb.prepare("DELETE FROM tags WHERE id = ?").run(id);
  return result.changes > 0;
}

export async function deleteMessageById(id: number) {
  await ensureInitialized();

  if (usePostgres && pgPool) {
    const result = await pgPool.query("DELETE FROM messages WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  if (!sqliteDb) return false;
  const result = sqliteDb.prepare("DELETE FROM messages WHERE id = ?").run(id);
  return result.changes > 0;
}

export async function markMessageAsRead(id: number) {
  await ensureInitialized();

  if (usePostgres && pgPool) {
    const result = await pgPool.query("UPDATE messages SET is_read = TRUE WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  if (!sqliteDb) return false;
  const result = sqliteDb.prepare("UPDATE messages SET is_read = 1 WHERE id = ?").run(id);
  return result.changes > 0;
}

