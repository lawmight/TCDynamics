/**
 * @tcd/shared-utils - Logger Core
 * Shared logger formatting utilities and log level definitions
 * Consolidated from frontend/logger.ts, api/_lib/logger.js, and backend/logger.js
 *
 * NOTE: This does NOT provide a full logger instance — each workspace
 * has different transport needs (console, Winston, fetch, etc.).
 * This module provides the shared formatting and sanitization core.
 */

import { sanitizeData } from './sanitize.js'

/** Log level enum using const object for JS consumer compatibility */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const

export type LogLevelValue = (typeof LogLevel)[keyof typeof LogLevel]

/**
 * Format a log message with timestamp and optional data.
 * Used by all workspace-specific loggers for consistent output.
 *
 * @param level - Log level string (e.g., 'INFO', 'ERROR')
 * @param message - Log message
 * @param data - Optional data to include (will be sanitized)
 * @returns Formatted log string
 */
export function formatMessage(
  level: string,
  message: string,
  data?: unknown
): string {
  const timestamp = new Date().toISOString()
  const dataStr = data
    ? ` | Data: ${JSON.stringify(sanitizeData(data))}`
    : ''
  return `[${timestamp}] ${level}: ${message}${dataStr}`
}

/**
 * Check if a given log level should be logged based on the configured minimum level.
 */
export function shouldLog(
  messageLevel: LogLevelValue,
  configuredLevel: LogLevelValue
): boolean {
  return messageLevel >= configuredLevel
}

// Re-export sanitize utilities for convenience
export { SENSITIVE_KEYS, sanitizeData, sanitizeString } from './sanitize.js'

