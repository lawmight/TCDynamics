const { Pool } = require('pg')

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://tcdynamics:changeme@postgres:5432/tcdynamics'

const pool = new Pool({
  connectionString: DEFAULT_DATABASE_URL,
  max: parseInt(process.env.PG_POOL_MAX || '10'),
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000'),
  connectionTimeoutMillis: parseInt(
    process.env.PG_CONNECTION_TIMEOUT_MS || '10000',
  ),
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

pool.on('error', err => {
  // Prevent the app from crashing due to an idle client error
  // Log and continue; callers should handle query errors
  console.error('Unexpected PG client error', err)
})

const query = async (text, params) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const durationMs = Date.now() - start
  if (durationMs > 500) {
    console.warn('Slow query detected', { durationMs, text })
  }
  return res
}

const getClient = () => pool.connect()

module.exports = {
  pool,
  query,
  getClient,
}
