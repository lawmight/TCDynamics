require('dotenv').config()
const express = require('express')
const cors = require('cors')
const compression = require('compression')
const morgan = require('morgan')
const { helmetConfig, validateIP, sanitizeInput } = require('./middleware/security')

// Import des routes
const contactRoutes = require('./routes/contact')
const demoRoutes = require('./routes/demo')
const monitoringRoutes = require('./routes/monitoring')

// Import de la documentation Swagger
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require('./swagger')

// Import du système de logging
const {
  logger,
  logRequest,
  logSecurityEvent,
  logPerformance,
  logError,
  addRequestId,
} = require('./utils/logger')

// Import des middlewares d'erreur
const {
  errorHandler,
  notFoundHandler,
  collectMetrics,
} = require('./middleware/errorHandler')

// Import du middleware CSRF
const { csrfToken, csrfProtection } = require('./middleware/csrf')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware de base
app.use(addRequestId)
app.use(helmetConfig)
app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  }
}))
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  })
)
app.use(morgan('combined'))
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf
  }
}))
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
app.listen(PORT, () => {
  logger.info('🚀 Serveur TCDynamics démarré', {
    port: PORT,
    environment: process.env.NODE_ENV,
    emailConfigured: !!process.env.EMAIL_USER,
    frontendUrl: process.env.FRONTEND_URL,
    apiDocsUrl: `http://localhost:${PORT}/api-docs`,
    openApiUrl: `http://localhost:${PORT}/api-docs.json`,
  })

  // Logs pour la console aussi
  // // console.log(`🚀 Serveur TCDynamics démarré sur le port ${PORT}`)
  // // console.log(`📧 Email configuré: ${process.env.EMAIL_USER}`)
  // // console.log(`�� Frontend URL: ${process.env.FRONTEND_URL}`)
  // // console.log(`🔒 Environnement: ${process.env.NODE_ENV}`)
  // // console.log(`📚 Documentation API: process.env.API_URL || 'process.env.API_URL || 'http://localhost:${PORT}/api-docs`)''
  // // console.log(`🔗 Spécification OpenAPI: process.env.API_URL || 'process.env.API_URL || 'http://localhost:${PORT}/api-docs.json`)''
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
