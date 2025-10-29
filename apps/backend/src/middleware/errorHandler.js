const { logError, logger } = require('../utils/logger')

// Error types
class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.statusCode = 400
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthenticationError'
    this.statusCode = 401
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthorizationError'
    this.statusCode = 403
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
    this.statusCode = 404
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConflictError'
    this.statusCode = 409
  }
}

class RateLimitError extends Error {
  constructor(message, retryAfter) {
    super(message)
    this.name = 'RateLimitError'
    this.statusCode = 429
    this.retryAfter = retryAfter
  }
}

// Error response formatter
const formatErrorResponse = (error, req) => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const baseResponse = {
    success: false,
    message: error.message || 'Une erreur est survenue',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  }

  // Add additional details in development
  if (process.env.NODE_ENV === 'development') {
    baseResponse.error = {
      name: error.name,
      stack: error.stack,
      ...(error.field && { field: error.field }),
    }
  }

  // Add retry information for rate limiting
  if (error.name === 'RateLimitError' && error.retryAfter) {
    baseResponse.retryAfter = error.retryAfter
  }

  return baseResponse
}

// Global error handler middleware
const errorHandler = (error, req, res, next) => {
  // Log the error with context
  logError(error, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id'],
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    params: req.params,
    headers: process.env.NODE_ENV === 'development' ? req.headers : undefined,
  })

  // Determine status code
  const statusCode = error.statusCode || 500

  // Format error response
  const errorResponse = formatErrorResponse(error, req)

  // Send response
  res.status(statusCode).json(errorResponse)
}

// Async error wrapper
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} non trouvée`)
  next(error)
}

// Validation error handler for Joi
const handleValidationError = error => {
  if (error.isJoi) {
    const field = error.details[0].path.join('.')
    const message = error.details[0].message
    return new ValidationError(message, field)
  }
  return error
}

// Database error handler
const handleDatabaseError = error => {
  if (error.code === '23505') {
    // Unique constraint violation
    return new ConflictError('Un enregistrement avec ces données existe déjà')
  }
  if (error.code === '23503') {
    // Foreign key constraint violation
    return new NotFoundError('Référence introuvable')
  }
  if (error.code === '23502') {
    // Not null constraint violation
    return new ValidationError('Champ requis manquant')
  }

  // Log database errors
  logger.error('Database error', { error: error.message, code: error.code })
  return new Error('Erreur de base de données')
}

// Email error handler
const handleEmailError = error => {
  logger.error('Email service error', { error: error.message })
  return new Error("Erreur lors de l'envoi de l'email")
}

module.exports = {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  handleValidationError,
  handleDatabaseError,
  handleEmailError,
}
