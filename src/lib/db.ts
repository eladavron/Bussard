'use server';

import postgres from 'postgres';

const SQL_USER=process.env.POSTGRES_USER;
const SQL_PASS=process.env.POSTGRES_PASSWORD;
const SQL_DB=process.env.POSTGRES_DB;

const connectionString = `postgresql://${SQL_USER}:${SQL_PASS}@localhost:5432/${SQL_DB}`

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Prevent multiple connections during development hot-reloading
const globalForDb = global as unknown as { conn: ReturnType<typeof postgres> | undefined };

// Disable prefetch as it is not supported for "Transaction" pool mode
export const db = globalForDb.conn ?? postgres(connectionString.trim(), { prepare: false });

if (process.env.NODE_ENV !== 'production') globalForDb.conn = db;
