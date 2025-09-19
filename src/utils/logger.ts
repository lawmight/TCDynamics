// Système de logging pour remplacer console.error
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  private formatMessage(level: string, message: string, error?: unknown): string {
    const timestamp = new Date().toISOString()
    const errorInfo = error ? ` | Error: ${error}` : ''
    return `[${timestamp}] ${level}: ${message}${errorInfo}`
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message), data)
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), data)
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), data)
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), error)
      
      // En production, envoyer à un service de monitoring
      if (import.meta.env.PROD) {
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
