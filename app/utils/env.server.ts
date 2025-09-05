
export const env = {
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  NODE_ENV: process.env.NODE_ENV || "development",
  INIT_DB_ON_BOOT: process.env.INIT_DB_ON_BOOT,
};

export function assertServerEnv() {
  if (!env.TURSO_DATABASE_URL) {
    throw new Error("Missing TURSO_DATABASE_URL environment variable");
  }
  // auth token can be empty if using file: URL locally or for libsql://
}
