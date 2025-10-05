// Système de logging sécurisé pour remplacer console.error
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO
  private isProduction: boolean

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level
    this.isProduction = import.meta.env.PROD
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  private formatMessage(
    level: string,
    message: string,
    error?: unknown
  ): string {
    const timestamp = new Date().toISOString()
    const errorInfo = error ? ` | Error: ${this.sanitizeError(error)}` : ''
    return `[${timestamp}] ${level}: ${this.sanitizeMessage(message)}${errorInfo}`
  }

  // Sanitize messages to avoid logging sensitive data
  sanitizeMessage(message: string): string {
    // Remove potential sensitive patterns
    return (
      message
        .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[REDACTED CARD]') // Credit cards
        // Phone numbers: common formats with optional +, separators, and proper digit counts
        .replace(
          /(?<![0-9])(?:\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?:\s*x\d+)?(?![0-9])/gi,
          '[REDACTED PHONE]'
        )
        // US SSN: ddd-dd-dddd format only (avoiding overly broad 9-digit matches)
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED SSN]')
        // Email addresses: case-insensitive
        .replace(
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
          '[REDACTED EMAIL]'
        )
    )
  }

  // Sanitize error objects to avoid logging sensitive data
  private sanitizeError(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message
      // Include stack trace in non-production or when in debug mode
      if (!this.isProduction || this.level <= LogLevel.DEBUG) {
        const stack = error.stack
        if (stack) {
          return `${message}\n${stack}`
        }
      }
      return message
    }
    return String(error)
  }

  // Configurable list of sensitive keys that should be fully redacted
  private readonly SENSITIVE_KEYS = new Set([
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

  // Maximum depth for object traversal to prevent huge objects
  private readonly MAX_DEPTH = 3

  // Maximum string length for previews
  private readonly MAX_STRING_LENGTH = 50

  // Sanitize data objects to avoid logging sensitive information
  protected sanitizeData(data?: unknown, depth: number = 0): unknown {
    if (data === null || data === undefined) return data

    // Prevent infinite recursion and huge objects
    if (depth > this.MAX_DEPTH) {
      return '<MAX_DEPTH_REACHED>'
    }

    const dataType = typeof data

    switch (dataType) {
      case 'string':
        return this.sanitizeString(data as string)
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
      return data.map(item => this.sanitizeData(item, depth + 1))
    }

    // Handle objects (including Dates, RegExp, etc.)
    if (data instanceof Date) {
      return '<Date>'
    }

    if (data instanceof RegExp) {
      return '<RegExp>'
    }

    if (data instanceof Error) {
      return `<Error: ${this.sanitizeString(data.message)}>`
    }

    // Handle plain objects
    if (typeof data === 'object') {
      const sanitized: Record<string, unknown> = {}

      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase()

        // Check if this is a sensitive key
        if (
          this.SENSITIVE_KEYS.has(lowerKey) ||
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('token') ||
          lowerKey.includes('key')
        ) {
          sanitized[key] = '<REDACTED>'
        } else {
          sanitized[key] = this.sanitizeData(value, depth + 1)
        }
      }

      return sanitized
    }

    // Fallback for unknown types
    return `<${dataType}>`
  }

  private sanitizeString(str: string): string {
    if (str.length <= this.MAX_STRING_LENGTH) {
      return str
    }

    // For long strings, show a preview with length indicator
    const preview = str.substring(0, this.MAX_STRING_LENGTH - 3)
    return `${preview}... (${str.length} chars)`
  }

  // Only log to console in development, never in production for security
  private safeLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    ...args: unknown[]
  ): void {
    if (!this.isProduction) {
      // eslint-disable-next-line no-console
      console[level](...args)
    }
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.safeLog(
        'debug',
        this.formatMessage('DEBUG', message),
        this.sanitizeData(data)
      )
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.safeLog(
        'info',
        this.formatMessage('INFO', message),
        this.sanitizeData(data)
      )
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.safeLog(
        'warn',
        this.formatMessage('WARN', message),
        this.sanitizeData(data)
      )
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.safeLog('error', this.formatMessage('ERROR', message), error)

      // En production, envoyer à un service de monitoring (sans console.log)
      if (this.isProduction) {
        this.sendToMonitoring(message, error)
      }
    }
  }

  private sendToMonitoring(message: string, error?: unknown): void {
    // Intégration avec un service de monitoring (ex: Sentry, LogRocket)
    // Pour l'instant, on peut utiliser l'API de monitoring existante
    try {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message,
          error: error instanceof Error ? error.stack : String(error),
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail if monitoring service is unavailable
      })
    } catch {
      // Silently fail
    }
  }
}

// Instance globale du logger
export const logger = new Logger(
  import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO
)

// Export class and method for testing
export { Logger }
export const sanitizeMessage = (message: string): string => {
  const tempLogger = new Logger(LogLevel.INFO)
  // Access private method for testing
  return (
    tempLogger as Logger & { sanitizeMessage: (msg: string) => string }
  ).sanitizeMessage(message)
}
