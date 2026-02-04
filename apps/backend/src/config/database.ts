/**
 * Database configuration and connection pool
 * Manages PostgreSQL connection pool
 */

import { Pool, PoolClient } from 'pg'
import { EnvironmentConfig } from './environment'

let pool: Pool | null = null

/** Throws if pool not initialized; returns the pool otherwise. */
function assertPool(): Pool {
  if (!pool) {
    throw new Error(
      'Database pool not initialized. Call initializeDatabase first.',
    )
  }
  return pool
}

/**
 * Initialize database connection pool
 */
export function initializeDatabase(
  config: EnvironmentConfig['database'],
): Pool {
  if (pool) {
    return pool
  }

  pool = new Pool({
    connectionString: config.url,
    max: config.poolMax,
    idleTimeoutMillis: config.idleTimeoutMs,
    connectionTimeoutMillis: config.connectionTimeoutMs,
    ssl: config.ssl,
  })

  pool.on('error', (err: unknown) => {
    // Prevent the app from crashing due to an idle client error
    // Log and continue; callers should handle query errors
    console.error('Unexpected PG client error', err)
  })

  return pool
}

/**
 * Execute a database query
 */
export async function query(
  text: string,
  params?: unknown[],
): Promise<{ rows: unknown[]; rowCount: number | null }> {
  const start = Date.now()
  const res = await assertPool().query(text, params)
  const durationMs = Date.now() - start

  if (durationMs > 500) {
    console.warn('Slow query detected', { durationMs, text })
  }

  return res
}

/**
 * Get a database client from the pool
 */
export function getClient(): Promise<PoolClient> {
  return assertPool().connect()
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

/**
 * Get the current pool instance (for advanced usage)
 */
export function getPool(): Pool | null {
  return pool
}
