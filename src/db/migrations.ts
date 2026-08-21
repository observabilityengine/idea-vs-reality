import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_VERSION = 1;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion < DATABASE_VERSION) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY NOT NULL,
        text TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
        created_at TEXT NOT NULL,
        completed_at TEXT,
        appointment_at TEXT,
        is_important INTEGER NOT NULL DEFAULT 0,
        inferred_minute INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_memories_status ON memories(status);
      CREATE INDEX IF NOT EXISTS idx_memories_appointment ON memories(appointment_at);
      CREATE INDEX IF NOT EXISTS idx_memories_completed_at ON memories(completed_at);
      PRAGMA user_version = 1;
    `);
  }
}
