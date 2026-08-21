import { DATABASE_VERSION, migrateDatabase } from '../src/db/migrations';

function makeDb(version: number) {
  let currentVersion = version;
  const transaction = {
    async execAsync(sql: string) {
      const match = sql.match(/PRAGMA user_version = (\d+)/);
      if (match) currentVersion = Number(match[1]);
    },
  };

  return {
    async execAsync() {},
    async getFirstAsync() {
      return { user_version: currentVersion };
    },
    async withExclusiveTransactionAsync(callback: (tx: typeof transaction) => Promise<void>) {
      await callback(transaction);
    },
    get version() {
      return currentVersion;
    },
  };
}

describe('database migrations', () => {
  it('creates the schema and advances version from an empty database', async () => {
    const db = makeDb(0);
    await migrateDatabase(db as never);
    expect(db.version).toBe(DATABASE_VERSION);
  });

  it('is idempotent when the database is already current', async () => {
    const db = makeDb(DATABASE_VERSION);
    await expect(migrateDatabase(db as never)).resolves.toBeUndefined();
    expect(db.version).toBe(DATABASE_VERSION);
  });

  it('refuses to open a database newer than the app supports', async () => {
    const db = makeDb(DATABASE_VERSION + 1);
    await expect(migrateDatabase(db as never)).rejects.toThrow(/newer than this app supports/);
  });

  it('fails closed when there is an unknown migration gap', async () => {
    const db = makeDb(2);
    await expect(migrateDatabase(db as never)).rejects.toThrow(/No migration path exists/);
  });
});
