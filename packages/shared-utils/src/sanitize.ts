/**
 * @tcd/shared-utils - Sanitize
 * Shared data sanitization utilities for secure logging
 * Consolidated from 3 near-identical implementations:
 *   - apps/frontend/src/utils/logger.ts
 *   - api/_lib/logger.js
 *   - apps/backend/src/utils/logger.js (partial overlap)
 */

/** Keys whose values should always be fully redacted in logs */
export const SENSITIVE_KEYS = new Set([
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

/** Maximum recursion depth for object sanitization */
export const MAX_DEPTH = 3

/** Maximum string length before truncation */
export const MAX_STRING_LENGTH = 50

/**
 * Sanitize string to avoid logging sensitive data.
 * Long strings are truncated with a length indicator.
 */
export function sanitizeString(
  str: string,
  maxLength: number = MAX_STRING_LENGTH
): string {
  if (str.length <= maxLength) {
    return str
  }

  const preview = str.substring(0, maxLength - 3)
  return `${preview}... (${str.length} chars)`
}

/**
 * Sanitize data object to avoid logging sensitive information.
 * Recursively processes objects, redacts sensitive keys, and truncates strings.
 *
 * @param data - Data to sanitize
 * @param depth - Current recursion depth (internal use)
 * @param options - Optional config for PII hashing
 * @returns Sanitized data safe for logging
 */
export function sanitizeData(
  data: unknown,
  depth: number = 0,
  options?: {
    piiFields?: Set<string>
    hashPii?: (value: string) => string | null
  }
): unknown {
  if (data === null || data === undefined) return data

  // Prevent infinite recursion and huge objects
  if (depth > MAX_DEPTH) {
    return '<MAX_DEPTH_REACHED>'
  }

  const dataType = typeof data

  switch (dataType) {
    case 'string':
      return sanitizeString(data as string)
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
    return data.map((item) => sanitizeData(item, depth + 1, options))
  }

  // Handle special object types
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
    const sanitized: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase()

      // Hash PII fields if handler provided
      if (options?.piiFields?.has(key) || options?.piiFields?.has(lowerKey)) {
        if (typeof value === 'string' && options?.hashPii) {
          sanitized[key] = options.hashPii(value) || '<REDACTED>'
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
        sanitized[key] = sanitizeData(value, depth + 1, options)
      }
    }

    return sanitized
  }

  // Fallback for unknown types
  return `<${dataType}>`
}
