import type { NewMemory } from '../src/domain/memory';

const rows: Record<string, unknown>[] = [];
let userVersion = 0;

const db = {
  async execAsync(sql: string) {
    if (sql.includes('CREATE TABLE')) userVersion = 0;
    const match = sql.match(/PRAGMA user_version = (\d+)/);
    if (match) userVersion = Number(match[1]);
  },
  async getFirstAsync() {
    return { user_version: userVersion };
  },
  async getAllAsync(sql: string) {
    if (sql.includes("status = 'active'")) return rows.filter(row => row.status === 'active');
    return rows.filter(row => row.status === 'completed');
  },
  async runAsync(sql: string, ...args: unknown[]) {
    if (sql.startsWith('INSERT')) {
      const [id, text, createdAt, appointmentAt, important, inferredMinute] = args;
      rows.push({
        id,
        text,
        status: 'active',
        created_at: createdAt,
        completed_at: null,
        appointment_at: appointmentAt,
        is_important: important,
        inferred_minute: inferredMinute,
      });
      return { changes: 1 };
    }
    const [completedAt, id] = args;
    const row = rows.find(item => item.id === id && item.status === 'active');
    if (!row) return { changes: 0 };
    row.status = 'completed';
    row.completed_at = completedAt;
    return { changes: 1 };
  },
  async withExclusiveTransactionAsync(callback: (tx: typeof db) => Promise<void>) {
    await callback(db);
  },
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => db),
}));

import {
  completeMemory,
  createMemory,
  listActiveMemories,
  listCompletedMemories,
  resetDatabaseForTests,
} from '../src/db/database';

const memory: NewMemory = {
  text: 'Call Toby',
  appointmentAt: '2026-08-22T13:00:00.000Z',
  isImportant: true,
  inferredMinute: null,
};

describe('database persistence and completion', () => {
  beforeEach(() => {
    rows.length = 0;
    resetDatabaseForTests();
    userVersion = 0;
  });

  it('creates a memory and reloads it through the database API', async () => {
    const created = await createMemory(memory);
    resetDatabaseForTests();

    const active = await listActiveMemories();
    expect(active).toHaveLength(1);
    expect(active[0]).toMatchObject({
      id: created.id,
      text: 'Call Toby',
      status: 'active',
      isImportant: true,
      appointmentAt: memory.appointmentAt,
    });
  });

  it('marks a memory completed without deleting it', async () => {
    const created = await createMemory(memory);
    await completeMemory(created.id);

    expect(await listActiveMemories()).toHaveLength(0);
    expect(await listCompletedMemories()).toHaveLength(1);
    expect((await listCompletedMemories())[0]).toMatchObject({
      id: created.id,
      status: 'completed',
    });
  });

  it('rejects completing a missing or already-completed memory', async () => {
    await expect(completeMemory('missing')).rejects.toThrow(/already completed|does not exist/);
  });
});
