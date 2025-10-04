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
  private sanitizeMessage(message: string): string {
    // Remove potential sensitive patterns
    return message
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[REDACTED CARD]') // Credit cards
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED SSN]') // SSN
      .replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[REDACTED EMAIL]'
      ) // Email
      .replace(/\b\d{10,15}\b/g, '[REDACTED PHONE]') // Phone numbers
  }

  // Sanitize error objects to avoid logging sensitive data
  private sanitizeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message // Only log the message, not the stack trace in production
    }
    return String(error)
  }

  // Sanitize data objects to avoid logging sensitive information
  private sanitizeData(data?: unknown): unknown {
    if (!data || typeof data !== 'object') return data

    // For production, return minimal safe data
    if (this.isProduction) {
      return '[DATA REDACTED FOR SECURITY]'
    }

    // In development, return the data as-is (could add more sanitization here if needed)
    return data
  }

  // Only log to console in development, never in production for security
  private safeLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    ...args: unknown[]
  ): void {
    if (!this.isProduction) {
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
