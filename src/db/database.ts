import * as SQLite from 'expo-sqlite';
import type { Memory, NewMemory } from '../domain/memory';
import { migrateDatabase } from './migrations';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) databasePromise = SQLite.openDatabaseAsync('head-check.db').then(async db => { await migrateDatabase(db); return db; });
  return databasePromise;
}
function rowToMemory(row: Record<string, unknown>): Memory { return { id: String(row.id), text: String(row.text), status: row.status === 'completed' ? 'completed' : 'active', createdAt: String(row.created_at), completedAt: row.completed_at ? String(row.completed_at) : null, appointmentAt: row.appointment_at ? String(row.appointment_at) : null, isImportant: Number(row.is_important) === 1, inferredMinute: row.inferred_minute == null ? null : Number(row.inferred_minute) }; }
export async function listActiveMemories(): Promise<Memory[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM memories WHERE status = 'active' ORDER BY created_at ASC`); return rows.map(rowToMemory); }
export async function createMemory(memory: NewMemory): Promise<Memory> { const db = await getDatabase(); const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; const createdAt = new Date().toISOString(); await db.runAsync(`INSERT INTO memories (id, text, status, created_at, completed_at, appointment_at, is_important, inferred_minute) VALUES (?, ?, 'active', ?, NULL, ?, ?, ?)`, id, memory.text, createdAt, memory.appointmentAt, memory.isImportant ? 1 : 0, memory.inferredMinute); return { id, text: memory.text, status: 'active', createdAt, completedAt: null, appointmentAt: memory.appointmentAt, isImportant: memory.isImportant, inferredMinute: memory.inferredMinute }; }
export async function completeMemory(id: string): Promise<void> { const db = await getDatabase(); await db.withExclusiveTransactionAsync(async transaction => { const completedAt = new Date().toISOString(); const result = await transaction.runAsync(`UPDATE memories SET status = 'completed', completed_at = ? WHERE id = ? AND status = 'active'`, completedAt, id); if (result.changes !== 1) throw new Error('Memory was already completed or does not exist.'); }); }
export async function restoreMemory(id: string): Promise<void> { const db = await getDatabase(); const result = await db.runAsync(`UPDATE memories SET status = 'active', completed_at = NULL WHERE id = ? AND status = 'completed'`, id); if (result.changes !== 1) throw new Error('Memory cannot be restored.'); }
export async function listCompletedMemories(): Promise<Memory[]> { const db = await getDatabase(); const rows = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM memories WHERE status = 'completed' ORDER BY completed_at DESC`); return rows.map(rowToMemory); }
export function resetDatabaseForTests(): void { databasePromise = null; }
