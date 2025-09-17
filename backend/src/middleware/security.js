const rateLimit = require('express-rate-limit')
const helmet = require('helmet')

// Rate limiting pour les formulaires
const formRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // 5 requêtes par IP
  message: {
    success: false,
    message: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Configuration Helmet pour la sécurité
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
})

// Middleware de validation IP
const validateIP = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress
  // console.log(`Requête de l'IP: ${clientIP}`)
  next()
}

module.exports = {
  formRateLimit,
  helmetConfig,
  validateIP,
}
