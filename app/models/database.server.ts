// models/database.server.ts
import {
  createClient,
  type Client,
  type InArgs,
  type InStatement,
  type InValue,
} from "@libsql/client";

import { assertServerEnv, env } from "../utils/env.server";

// Validate environment variables
assertServerEnv();

const { INIT_DB_ON_BOOT } = process.env;

let client: Client | null = null;
function getClient(): Client {
  if (client) return client;
  client = createClient({
    url: env.TURSO_DATABASE_URL!,
    authToken: env.TURSO_AUTH_TOKEN || undefined,
  });
  return client;
}

// Allow both prepare().get(x, y) and prepare().get([x, y])
function normalizeArgs(args: unknown[]): InArgs {
  const flat = args.length === 1 && Array.isArray(args[0]) ? (args[0] as unknown[]) : args;
  // LibSQL doesn't accept booleans; convert if you use them in params.
  for (let i = 0; i < flat.length; i++) {
    if (typeof flat[i] === "boolean") flat[i] = flat[i] ? 1 : 0;
  }
  return flat as InValue[];
}

// Tiny compat layer that looks like better-sqlite3
export const db = {
  async exec(sql: string, args: unknown[] = []) {
    await getClient().execute({ sql, args: normalizeArgs(args) } as InStatement);
  },

  async get<T = Record<string, unknown>>(sql: string, args: unknown[] = []) {
    const res = await getClient().execute({ sql, args: normalizeArgs(args) } as InStatement);
    return (res.rows[0] as T) ?? undefined;
  },

  async all<T = Record<string, unknown>>(sql: string, args: unknown[] = []) {
    const res = await getClient().execute({ sql, args: normalizeArgs(args) } as InStatement);
    return res.rows as T[];
  },

  prepare(sql: string) {
    return {
      get: async (...args: unknown[]) => db.get(sql, args),
      all: async (...args: unknown[]) => db.all(sql, args),
      run: async (...args: unknown[]) => {
        const res = await getClient().execute({ sql, args: normalizeArgs(args) } as InStatement);
        return {
          lastInsertRowid: (res.lastInsertRowid as unknown) ?? undefined,
          changes: (res.rowsAffected as number | undefined) ?? 0,
        };
      },
    };
  },

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const c = getClient();
    try {
      await c.execute("BEGIN");
      const out = await fn();
      await c.execute("COMMIT");
      return out;
    } catch (e) {
      try {
        await c.execute("ROLLBACK");
      } catch (rollbackError) {
        // Ignore rollback errors if no transaction is active
        console.warn("Rollback failed (transaction may not be active):", rollbackError);
      }
      throw e;
    }
  },
};

// -------- Database initialization --------
export async function initializeDatabase() {
  console.log("🚀 Initializing database schema...");
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_commitments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      target_amount INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      UNIQUE(user_id, category_id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS progress_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      added_by_user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (added_by_user_id) REFERENCES users(id)
    )
  `);

  const row = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM categories");
  if (!row || row.count === 0) {
    const insert = db.prepare("INSERT INTO categories (name, unit) VALUES (?, ?)");
    await insert.run("Donuts", "stk");
    await insert.run("Øl", "stk");
    await insert.run("Løping", "km");
    await insert.run("Runk", "stk");
    console.log("✅ Default categories added");
  }
  
  console.log("✅ Database schema initialization complete");
}

// Initialize with default data as well
export async function initializeDatabaseWithData() {
  await initializeDatabase();
  
  // Import and run data initialization
  const { initializeDefaultData } = await import("../utils/init-data");
  await initializeDefaultData();
  
  console.log("✅ Full database initialization complete");
}

// Auto-initialize for production deployment
if (env.NODE_ENV === "production" || INIT_DB_ON_BOOT === "true") {
  initializeDatabaseWithData().catch((e) => {
    console.error("❌ Database initialization failed:", e);
    // Don't exit process in production, let the app try to continue
    if (env.NODE_ENV !== "production") {
      process.exit(1);
    }
  });
}

export default db;
