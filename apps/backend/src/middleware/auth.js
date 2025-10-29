const { logger } = require('../utils/logger')

/**
 * API Key Authentication Middleware
 * Validates API key from Authorization header or X-API-Key header
 */
const apiKeyAuth = (req, res, next) => {
  const apiKey =
    req.headers['x-api-key'] ||
    req.headers['authorization']?.replace('Bearer ', '') ||
    req.query.apiKey

  const validApiKey = process.env.API_KEY || process.env.ADMIN_KEY

  if (!validApiKey) {
    logger.warn('API authentication attempted but no API key configured', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'],
    })
    return res.status(500).json({
      success: false,
      message: 'API authentication not configured',
    })
  }

  if (!apiKey) {
    logger.warn('API authentication failed: No API key provided', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'],
    })
    return res.status(401).json({
      success: false,
      message: 'API key required',
    })
  }

  if (apiKey !== validApiKey) {
    logger.warn('API authentication failed: Invalid API key', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'],
    })
    return res.status(401).json({
      success: false,
      message: 'Invalid API key',
    })
  }

  logger.info('API authentication successful', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id'],
  })

  next()
}

/**
 * Optional API Key Authentication Middleware
 * Validates API key if provided, but doesn't require it
 */
const optionalApiKeyAuth = (req, res, next) => {
  const apiKey =
    req.headers['x-api-key'] ||
    req.headers['authorization']?.replace('Bearer ', '') ||
    req.query.apiKey

  const validApiKey = process.env.API_KEY || process.env.ADMIN_KEY

  if (apiKey && validApiKey && apiKey !== validApiKey) {
    logger.warn('Optional API authentication failed: Invalid API key', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'],
    })
    return res.status(401).json({
      success: false,
      message: 'Invalid API key',
    })
  }

  // Add authentication status to request
  req.authenticated = !!(apiKey && validApiKey && apiKey === validApiKey)

  next()
}

module.exports = {
  apiKeyAuth,
  optionalApiKeyAuth,
}
