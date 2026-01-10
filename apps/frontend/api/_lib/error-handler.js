/**
 * Error Response Helper
 * Creates standardized error responses with environment-aware message sanitization
 * Production: Generic messages, detailed errors logged server-side
 * Development: Include error details for debugging
 */

import { logger } from './logger.js'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Create standardized error response
 * @param {string} message - Error message (will be sanitized in production)
 * @param {number} statusCode - HTTP status code
 * @param {Error|unknown} error - Error object (for logging)
 * @param {string} requestId - Optional request ID for tracking
 * @returns {object} Error response object
 */
export function createErrorResponse(
  message,
  statusCode = 500,
  error = null,
  requestId = null
) {
  // Log detailed error server-side
  if (error) {
    logger.error(message, error)
  } else {
    logger.error(message)
  }

  // In production, return generic message
  // In development, include more details
  const response = {
    success: false,
    error: isProduction
      ? 'An error occurred processing your request'
      : message,
  }

  if (requestId) {
    response.requestId = requestId
  }

  // In development, include error details
  if (!isProduction && error instanceof Error) {
    response.details = {
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    statusCode,
    response,
  }
}
