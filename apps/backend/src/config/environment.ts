/**
 * Environment configuration
 * Centralizes all environment variable access and validation
 */

export interface EnvironmentConfig {
  nodeEnv: string
  port: number
  frontendUrl: string
  allowedOrigins: string[]
  database: {
    url: string
    poolMax: number
    idleTimeoutMs: number
    connectionTimeoutMs: number
    ssl: boolean | { rejectUnauthorized: boolean }
  }
  email: {
    host: string
    port: number
    secure: boolean
    user: string
    pass: string
  }
  security: {
    sessionSecret: string
    adminApiKey: string
    jwtSecret: string
  }
}

/**
 * Load and validate environment variables
 */
export function loadEnvironment(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || 'development'
  const port = parseInt(process.env.PORT || '8080')

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [
        'https://tcdynamics.fr',
        'https://www.tcdynamics.fr',
        process.env.FRONTEND_URL || 'http://localhost:8080',
      ].filter(Boolean)

  return {
    nodeEnv,
    port,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
    allowedOrigins,
    database: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://tcdynamics:changeme@postgres:5432/tcdynamics',
      poolMax: parseInt(process.env.PG_POOL_MAX || '10'),
      idleTimeoutMs: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000'),
      connectionTimeoutMs: parseInt(
        process.env.PG_CONNECTION_TIMEOUT_MS || '10000',
      ),
      ssl:
        process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.zoho.eu',
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
    security: {
      sessionSecret: process.env.SESSION_SECRET || '',
      adminApiKey: process.env.ADMIN_API_KEY || '',
      jwtSecret: process.env.JWT_SECRET || '',
    },
  }
}

/**
 * Validate critical environment variables
 */
export function validateEnvironment(config: EnvironmentConfig): void {
  const errors: string[] = []

  if (!config.email.user) {
    errors.push('EMAIL_USER is required')
  }

  if (!config.email.pass) {
    errors.push('EMAIL_PASS is required')
  }

  if (errors.length > 0) {
    console.warn('⚠️  Environment validation warnings:')
    errors.forEach(error => console.warn(`  - ${error}`))
  }
}
