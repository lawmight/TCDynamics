/**
 * API Logger Utility
 * Secure logging for serverless functions with PII hashing
 * Similar to frontend logger but adapted for Node.js serverless environment
 */

import { hashPii } from './pii-hash.js'

const isProduction = process.env.NODE_ENV === 'production'

// Sensitive keys that should be redacted
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'key',
  'apikey',
  'auth',
  'authorization',
  'bearer',
  'jwt',
  'session',
  'cookie',
  'creditcard',
  'cardnumber',
  'cvv',
  'pin',
  'ssn',
  'socialsecurity',
  'privatekey',
  'certificate',
])

// PII fields that should be hashed before logging
const PII_FIELDS = new Set(['clerkId', 'userId', 'orgId', 'user_id', 'org_id'])

const MAX_DEPTH = 3
const MAX_STRING_LENGTH = 50

/**
 * Sanitize data object to avoid logging sensitive information
 * @param {unknown} data - Data to sanitize
 * @param {number} depth - Current recursion depth
 * @returns {unknown} Sanitized data
 */
function sanitizeData(data, depth = 0) {
  if (data === null || data === undefined) return data

  // Prevent infinite recursion and huge objects
  if (depth > MAX_DEPTH) {
    return '<MAX_DEPTH_REACHED>'
  }

  const dataType = typeof data

  switch (dataType) {
    case 'string':
      return sanitizeString(data)
    case 'number':
      return '<number>'
    case 'boolean':
      return '<boolean>'
    case 'function':
      return '<function>'
    case 'symbol':
      return '<symbol>'
    case 'bigint':
      return '<bigint>'
    default:
      break
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, depth + 1))
  }

  // Handle objects
  if (data instanceof Date) {
    return '<Date>'
  }

  if (data instanceof RegExp) {
    return '<RegExp>'
  }

  if (data instanceof Error) {
    return `<Error: ${sanitizeString(data.message)}>`
  }

  // Handle plain objects
  if (typeof data === 'object') {
    const sanitized = {}

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()

      // Hash PII fields
      if (PII_FIELDS.has(key) || PII_FIELDS.has(lowerKey)) {
        if (typeof value === 'string') {
          sanitized[key] = hashPii(value) || '<REDACTED>'
        } else {
          sanitized[key] = '<REDACTED>'
        }
        continue
      }

      // Check if this is a sensitive key
      if (
        SENSITIVE_KEYS.has(lowerKey) ||
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('key')
      ) {
        sanitized[key] = '<REDACTED>'
      } else {
        sanitized[key] = sanitizeData(value, depth + 1)
      }
    }

    return sanitized
  }

  // Fallback for unknown types
  return `<${dataType}>`
}

/**
 * Sanitize string to avoid logging sensitive data
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (str.length <= MAX_STRING_LENGTH) {
    return str
  }

  // For long strings, show a preview with length indicator
  const preview = str.substring(0, MAX_STRING_LENGTH - 3)
  return `${preview}... (${str.length} chars)`
}

/**
 * Format log message with timestamp
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {unknown} data - Optional data to log
 * @returns {string} Formatted message
 */
function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString()
  const dataStr = data ? ` | Data: ${JSON.stringify(sanitizeData(data))}` : ''
  return `[${timestamp}] ${level}: ${message}${dataStr}`
}

/**
 * Logger class for API serverless functions
 */
class Logger {
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {unknown} data - Optional data to log
   */
  info(message, data) {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.log(formatMessage('INFO', message, data))
    }
    // In production, could send to monitoring service (Sentry, etc.)
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {unknown} data - Optional data to log
   */
  warn(message, data) {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.warn(formatMessage('WARN', message, data))
    }
    // In production, could send to monitoring service
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {unknown} error - Error object or data
   */
  error(message, error) {
    const errorData =
      error instanceof Error
        ? {
            message: error.message,
            stack: isProduction ? undefined : error.stack,
          }
        : error

    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.error(formatMessage('ERROR', message, errorData))
    }
    // In production, send to monitoring service (Sentry, etc.)
    // TODO: Integrate with Sentry when available
  }

  /**
   * Log debug message (only in development)
   * @param {string} message - Log message
   * @param {unknown} data - Optional data to log
   */
  debug(message, data) {
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.debug(formatMessage('DEBUG', message, data))
    }
  }
}

// Export singleton instance
export const logger = new Logger()

export default logger
