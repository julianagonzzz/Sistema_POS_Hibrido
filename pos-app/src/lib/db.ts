import { Pool } from 'pg'

const globalForPg = globalThis as unknown as { pgPool?: Pool }

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool
}

/**
 * Ejecuta una consulta SQL directa contra la base de datos PostgreSQL.
 */
export async function query(sql: string, params?: any[]) {
  return pool.query(sql, params)
}