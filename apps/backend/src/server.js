// Add error handlers at the very top before any imports
process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error)
  console.error('Stack:', error.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

console.log('🔧 Loading environment variables...')
require('dotenv').config()
console.log('✅ Environment variables loaded')

console.log('🔧 Loading Express and core modules...')
const express = require('express')
console.log('✅ Express loaded')
const cors = require('cors')
console.log('✅ CORS loaded')
const compression = require('compression')
console.log('✅ Compression loaded')
const morgan = require('morgan')
console.log('✅ Morgan loaded')

console.log('🔧 Loading security middleware...')
let helmetConfig, validateIP, sanitizeInput
try {
  const securityModule = require('./middleware/security')
  helmetConfig = securityModule.helmetConfig
  validateIP = securityModule.validateIP
  sanitizeInput = securityModule.sanitizeInput
  console.log('✅ Security middleware loaded')
} catch (error) {
  console.error('❌ Failed to load security middleware:', error.message)
  console.error(error.stack)
  process.exit(1)
}

// Import des routes
console.log('🔧 Loading route modules...')
let contactRoutes,
  demoRoutes,
  monitoringRoutes,
  stripeRoutes,
  rumRoutes,
  feedbackRoutes

try {
  contactRoutes = require('./routes/contact')
  console.log('✅ Contact routes loaded')
} catch (error) {
  console.error('❌ Failed to load contact routes:', error.message)
  console.error(error.stack)
  process.exit(1)
}

try {
  demoRoutes = require('./routes/demo')
  console.log('✅ Demo routes loaded')
} catch (error) {
  console.error('❌ Failed to load demo routes:', error.message)
  console.error(error.stack)
  process.exit(1)
}

try {
  const monitoringModule = require('./routes/monitoring')
  monitoringRoutes = monitoringModule.router
  console.log('✅ Monitoring routes loaded')
} catch (error) {
  console.error('❌ Failed to load monitoring routes:', error.message)
  console.error(error.stack)
  process.exit(1)
}

try {
  stripeRoutes = require('./routes/stripe')
  console.log('✅ Stripe routes loaded')
} catch (error) {
  console.error('❌ Failed to load stripe routes:', error.message)
  console.error(error.stack)
  process.exit(1)
}


try {
  rumRoutes = require('./routes/rum')
  console.log('✅ RUM routes loaded')
} catch (error) {
  console.error('❌ Failed to load RUM routes:', error.message)
  console.error(error.stack)
  process.exit(1)
}

try {
  feedbackRoutes = require('./routes/feedback')
  console.log('✅ Feedback routes loaded')
} catch (error) {
  console.error('❌ Failed to load feedback routes:', error.message)
  console.error(error.stack)
  process.exit(1)
}

// Import de la documentation Swagger
console.log('🔧 Loading Swagger documentation...')
let swaggerUi, swaggerSpec, swaggerUiOptions
try {
  const swaggerModule = require('./swagger')
  swaggerUi = swaggerModule.swaggerUi
  swaggerSpec = swaggerModule.swaggerSpec
  swaggerUiOptions = swaggerModule.swaggerUiOptions
  console.log('✅ Swagger documentation loaded')
} catch (error) {
  console.error('❌ Failed to load Swagger:', error.message)
  console.error(error.stack)
  process.exit(1)
}

// Import du système de logging
console.log('🔧 Loading logging system...')
let logger, logRequest, logSecurityEvent, logPerformance, logError, addRequestId
try {
  const loggerModule = require('./utils/logger')
  logger = loggerModule.logger
  logRequest = loggerModule.logRequest
  logSecurityEvent = loggerModule.logSecurityEvent
  logPerformance = loggerModule.logPerformance
  logError = loggerModule.logError
  addRequestId = loggerModule.addRequestId
  console.log('✅ Logging system loaded')
} catch (error) {
  console.error('❌ Failed to load logging system:', error.message)
  console.error(error.stack)
  process.exit(1)
}

// Import des middlewares d'erreur
console.log('🔧 Loading error handlers...')
let errorHandler, notFoundHandler
try {
  const errorModule = require('./middleware/errorHandler')
  errorHandler = errorModule.errorHandler
  notFoundHandler = errorModule.notFoundHandler
  console.log('✅ Error handlers loaded')
} catch (error) {
  console.error('❌ Failed to load error handlers:', error.message)
  console.error(error.stack)
  process.exit(1)
}

// Import des middlewares de monitoring
console.log('🔧 Loading metrics...')
let collectMetrics, collectErrorMetrics
try {
  const metricsModule = require('./routes/monitoring')
  collectMetrics = metricsModule.collectMetrics
  collectErrorMetrics = metricsModule.collectErrorMetrics
  console.log('✅ Metrics loaded')
} catch (error) {
  console.error('❌ Failed to load metrics:', error.message)
  console.error(error.stack)
  process.exit(1)
}

// Import du middleware CSRF
console.log('🔧 Loading CSRF middleware...')
let csrfToken, csrfProtection
try {
  const csrfModule = require('./middleware/csrf')
  csrfToken = csrfModule.csrfToken
  csrfProtection = csrfModule.csrfProtection
  console.log('✅ CSRF middleware loaded')
} catch (error) {
  console.error('❌ Failed to load CSRF middleware:', error.message)
  console.error(error.stack)
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 8080

// Middleware de base
app.use(addRequestId)
app.use(helmetConfig)
app.use(
  compression({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    },
  })
)
// CORS Whitelist Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Define allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [
          'https://tcdynamics.fr',
          'https://www.tcdynamics.fr',
          process.env.FRONTEND_URL || 'http://localhost:8080',
        ].filter(Boolean)

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.use(morgan('combined'))
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      // Store raw body for webhook verification if needed
      req.rawBody = buf
    },
  })
)
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(collectMetrics)
app.use(validateIP)
app.use(sanitizeInput)

// CSRF protection middleware
app.use(csrfToken)
app.use(csrfProtection)

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "OK"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *               uptime: 3600.5
 *               environment: "development"
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  })
})

// CSRF token endpoint for frontend
app.get('/api/csrf-token', (req, res) => {
  res.json({
    csrfToken: res.locals.csrfToken,
  })
})

// Routes API
app.use('/api', contactRoutes)
app.use('/api', demoRoutes)
app.use('/api', monitoringRoutes)
app.use('/api', stripeRoutes)
app.use('/api', rumRoutes)
app.use('/api', feedbackRoutes)

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "API TCDynamics fonctionnelle"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 */
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API TCDynamics fonctionnelle',
    timestamp: new Date().toISOString(),
  })
})

// Documentation Swagger
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Gestion des erreurs 404
app.use(notFoundHandler)

// Gestionnaire d'erreurs global
app.use(errorHandler)

// Démarrage du serveur
console.log('🔧 Starting server...')
const server = app.listen(PORT, () => {
  console.log('='.repeat(60))
  console.log('🚀 SERVER STARTED SUCCESSFULLY')
  console.log('='.repeat(60))
  console.log(`Port: ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(
    `Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`
  )
  console.log(`Stripe Configured: ${!!process.env.STRIPE_SECRET_KEY}`)
  console.log(`Email Configured: ${!!process.env.EMAIL_USER}`)
  console.log('')
  console.log('📋 Available Endpoints:')
  console.log(`  Health Check: http://localhost:${PORT}/health`)
  console.log(`  API Test: http://localhost:${PORT}/api/test`)
  console.log(`  API Docs: http://localhost:${PORT}/api-docs`)
  console.log(``)
  console.log('')
  console.log('✅ Server is ready to accept requests')
  console.log('='.repeat(60))

  // Also log using the logger if available
  if (logger && typeof logger.info === 'function') {
    logger.info('🚀 Serveur TCDynamics démarré', {
      port: PORT,
      environment: process.env.NODE_ENV,
      emailConfigured: !!process.env.EMAIL_USER,
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      frontendUrl: process.env.FRONTEND_URL,
      apiDocsUrl: `http://localhost:${PORT}/api-docs`,
      openApiUrl: `http://localhost:${PORT}/api-docs.json`,
    })
  }
})

// Add server error handler
server.on('error', error => {
  console.error('❌ Server failed to start:', error)
  if (error.code === 'EADDRINUSE') {
    console.error(
      `❌ Port ${PORT} is already in use. Please use a different port or kill the process using this port.`
    )
  }
  process.exit(1)
})

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  logger.info('🛑 Signal SIGTERM reçu, arrêt gracieux du serveur')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('🛑 Signal SIGINT reçu, arrêt gracieux du serveur')
  process.exit(0)
})

// Gestion des erreurs non capturées
process.on('uncaughtException', error => {
  logger.error('Exception non capturée', {
    error: error.message,
    stack: error.stack,
  })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejet de promesse non géré', { reason, promise })
  process.exit(1)
})
