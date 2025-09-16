require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { helmetConfig, validateIP } = require('./middleware/security')

// Import des routes
const contactRoutes = require('./routes/contact')
const demoRoutes = require('./routes/demo')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware de base
app.use(helmetConfig)

// CORS configuration with multiple origins support
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:8080', 'http://localhost:3000']

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true)
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(validateIP)

// Routes de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  })
})

// Routes API
app.use('/api', contactRoutes)
app.use('/api', demoRoutes)

// Route de test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API TCDynamics fonctionnelle',
    timestamp: new Date().toISOString(),
  })
})

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  })
})

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error)

  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  })
})

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur TCDynamics démarré sur le port ${PORT}`)
  console.log(`📧 Email configuré: ${process.env.EMAIL_USER}`)
  console.log(`�� Frontend URL: ${process.env.FRONTEND_URL}`)
  console.log(`🔒 Environnement: ${process.env.NODE_ENV}`)
})

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('�� Arrêt du serveur...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur...')
  process.exit(0)
})
