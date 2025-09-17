const winston = require('winston')
const path = require('path')

// Définir les niveaux de log personnalisés
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    security: 5,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
    security: 'red',
  },
}

// Ajouter les couleurs à winston
winston.addColors(customLevels.colors)

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(info => {
    const { timestamp, level, message, ...meta } = info

    // Structure du log
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta,
    }

    // En développement, ajouter des couleurs
    if (process.env.NODE_ENV !== 'production') {
      return winston.format
        .colorize()
        .colorize(level, JSON.stringify(logEntry, null, 2))
    }

    return JSON.stringify(logEntry)
  })
)

// Configuration des transports
const transports = []

// Transport console pour tous les environnements
transports.push(
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format:
      process.env.NODE_ENV === 'production'
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const metaStr = Object.keys(meta).length
                ? `\n${JSON.stringify(meta, null, 2)}`
                : ''
              return `${timestamp} [${level}]: ${message}${metaStr}`
            })
          ),
  })
)

// Transport fichier pour les erreurs (tous environnements)
transports.push(
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    format: customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
)

// Transport fichier pour tous les logs en production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      level: 'info',
      format: customFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  )
}

// Transport spécial pour les logs de sécurité
transports.push(
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/security.log'),
    level: 'security',
    format: customFormat,
    maxsize: 2097152, // 2MB
    maxFiles: 3,
  })
)

// Créer l'instance du logger
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports,
  exitOnError: false,
})

// Gestionnaire d'erreurs non capturées
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/exceptions.log'),
    format: customFormat,
  })
)

// Gestionnaire de rejets de promesses non gérés
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/rejections.log'),
    format: customFormat,
  })
)

// Fonctions utilitaires pour le logging
const logRequest = (req, res, next) => {
  const start = Date.now()

  // Log de la requête entrante
  logger.http('Requête entrante', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id'] || 'unknown',
  })

  // Intercepter la réponse pour logger les métriques
  const originalSend = res.send
  res.send = function (body) {
    const duration = Date.now() - start

    logger.http('Réponse envoyée', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      size: Buffer.isBuffer(body)
        ? body.length
        : typeof body === 'string'
          ? Buffer.byteLength(body, 'utf8')
          : 0,
      requestId: req.headers['x-request-id'] || 'unknown',
    })

    originalSend.call(this, body)
  }

  next()
}

const logSecurityEvent = (event, details) => {
  logger.security(`Événement de sécurité: ${event}`, {
    timestamp: new Date().toISOString(),
    ...details,
  })
}

const logPerformance = (operation, duration, metadata = {}) => {
  logger.info(`Performance: ${operation}`, {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  })
}

const logError = (error, context = {}) => {
  logger.error('Erreur capturée', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
    timestamp: new Date().toISOString(),
  })
}

// Middleware pour ajouter un ID de requête
const addRequestId = (req, res, next) => {
  req.headers['x-request-id'] =
    req.headers['x-request-id'] ||
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  res.setHeader('X-Request-ID', req.headers['x-request-id'])
  next()
}

module.exports = {
  logger,
  logRequest,
  logSecurityEvent,
  logPerformance,
  logError,
  addRequestId,
}
