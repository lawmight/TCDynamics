/**
 * Express application setup
 * Configures and returns the Express app instance
 */

import express, { Express } from 'express'
import { createRequire } from 'module'
import { initializeDatabase } from './config/database'
import { loadEnvironment, validateEnvironment } from './config/environment'
import {
  configureErrorHandling,
  configureMiddleware,
} from './config/middleware'
import { initializeEmailService } from './services/email.service'

// Import routes using createRequire for CommonJS compatibility
const require = createRequire(import.meta.url)
const contactRoutes = require('./routes/contact')
const demoRoutes = require('./routes/demo')
const monitoringModule = require('./routes/monitoring')
const rumRoutes = require('./routes/rum')
const feedbackRoutes = require('./routes/feedback')

// Import Swagger
const swaggerModule = require('./swagger')

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  // Load environment configuration
  const config = loadEnvironment()
  validateEnvironment(config)

  // Initialize services
  console.log('🔧 Initializing services...')
  initializeDatabase(config.database)
  initializeEmailService(config.email)
  console.log('✅ Services initialized')

  // Create Express app
  const app = express()

  // Configure middleware
  console.log('🔧 Configuring middleware...')
  configureMiddleware(app, config)
  console.log('✅ Middleware configured')

  // Health check endpoint
  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Vérifier l'état de santé du serveur
   *     description: Endpoint pour vérifier si le serveur fonctionne correctement
   *     tags:
   *       - Health
   *     responses:
   *       200:
   *         description: Serveur opérationnel
   */
  app.get('/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    })
  })

  // CSRF token endpoint for frontend
  app.get('/api/csrf-token', (_req, res) => {
    res.json({
      csrfToken: (res.locals as { csrfToken?: string }).csrfToken,
    })
  })

  // API routes
  console.log('🔧 Loading routes...')
  app.use('/api', contactRoutes)
  app.use('/api', demoRoutes)
  app.use('/api', monitoringModule.router)
  app.use('/api', rumRoutes)
  app.use('/api', feedbackRoutes)
  console.log('✅ Routes loaded')

  // API test endpoint
  /**
   * @swagger
   * /api/test:
   *   get:
   *     summary: Test de l'API
   *     description: Endpoint simple pour vérifier que l'API fonctionne
   *     tags:
   *       - Test
   *     responses:
   *       200:
   *         description: API fonctionnelle
   */
  app.get('/api/test', (_req, res) => {
    res.json({
      success: true,
      message: 'API TCDynamics fonctionnelle',
      timestamp: new Date().toISOString(),
    })
  })

  // Swagger documentation
  const { swaggerUi, swaggerSpec, swaggerUiOptions } = swaggerModule
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions),
  )
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  // Error handling (must be last)
  configureErrorHandling(app)

  return app
}
