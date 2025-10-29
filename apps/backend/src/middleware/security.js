const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const { logger } = require('../utils/logger')

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
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
})

// Middleware de validation IP
const validateIP = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress

  // Block known malicious IPs (you can expand this list)
  const blockedIPs = process.env.BLOCKED_IPS
    ? process.env.BLOCKED_IPS.split(',')
    : []

  if (blockedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé',
    })
  }

  // Log suspicious activity
  if (req.headers['user-agent'] && req.headers['user-agent'].includes('bot')) {
    // Log bot activity for monitoring
    logger.security('Bot activity detected', {
      ip: clientIP,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method
    })
  }

  next()
}

// Additional security middleware for input sanitization
const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters from string inputs
  const sanitizeString = str => {
    if (typeof str !== 'string') return str
    return str.replace(/[<>\"'%;()&+]/g, '')
  }

  // Sanitize body parameters
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key])
      }
    }
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key])
      }
    }
  }

  next()
}

module.exports = {
  formRateLimit,
  helmetConfig,
  validateIP,
  sanitizeInput,
}
