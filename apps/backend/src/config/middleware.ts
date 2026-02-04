/**
 * Middleware configuration
 * Centralizes middleware setup and configuration
 */

import compression from 'compression'
import type { CorsOptions } from 'cors'
import cors from 'cors'
import express, { Express, Request, Response } from 'express'
import { createRequire } from 'module'
import morgan from 'morgan'
import { EnvironmentConfig } from './environment'

// Import middleware modules using createRequire for CommonJS compatibility
const require = createRequire(import.meta.url)
const securityModule = require('../middleware/security')
const csrfModule = require('../middleware/csrf')
const loggerModule = require('../utils/logger')
const errorModule = require('../middleware/errorHandler')
const monitoringModule = require('../routes/monitoring')

/**
 * Configure and apply all middleware to Express app
 */
export function configureMiddleware(
  app: Express,
  config: EnvironmentConfig,
): void {
  const { addRequestId } = loggerModule
  const { helmetConfig, validateIP, sanitizeInput } = securityModule
  const { csrfToken, csrfProtection } = csrfModule
  const { collectMetrics } = monitoringModule

  // Request ID middleware (must be first)
  app.use(addRequestId)

  // Security headers
  app.use(helmetConfig)

  // Compression
  app.use(
    compression({
      level: 6,
      threshold: 1024, // Only compress responses > 1KB
      filter: (req: Request, res: Response) => {
        if (req.headers['x-no-compression']) {
          return false
        }
        return compression.filter(req, res)
      },
    },
    ),
  )

  // CORS configuration
  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      if (config.allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  }
  app.use(cors(corsOptions))

  // Logging
  app.use(morgan('combined'))

  // Body parsing
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: Request, _res: Response, buf: Buffer) => {
        // Store raw body for webhook verification if needed
        ;(req as Request & { rawBody?: Buffer }).rawBody = buf
      },
    },
    ),
  )
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Metrics collection
  app.use(collectMetrics)

  // Security middleware
  app.use(validateIP)
  app.use(sanitizeInput)

  // CSRF protection
  app.use(csrfToken)
  app.use(csrfProtection)
}

/**
 * Configure error handling middleware (must be last)
 */
export function configureErrorHandling(app: Express): void {
  const { errorHandler, notFoundHandler } = errorModule

  // 404 handler
  app.use(notFoundHandler)

  // Global error handler
  app.use(errorHandler)
}
