import { Pool, QueryResultRow } from 'pg';

const globalForPg = globalThis as unknown as { pool: Pool };

const pool = globalForPg.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pool = pool;
}

export function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: (string | number | boolean | null)[]) {
  return pool.query<T>(text, params);
}