import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Prevent multiple connections during development hot-reloading
const globalForDb = global as unknown as { conn: ReturnType<typeof postgres> | undefined };

// Disable prefetch as it is not supported for "Transaction" pool mode
export const db = globalForDb.conn ?? postgres(connectionString.trim(), { prepare: false });

if (process.env.NODE_ENV !== 'production') globalForDb.conn = db;
