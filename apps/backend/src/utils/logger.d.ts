/**
 * Logger module type declarations
 */

export interface Logger {
  info: (msg: string, meta?: Record<string, unknown>) => void
  error: (msg: string, meta?: Record<string, unknown>) => void
  warn: (msg: string, meta?: Record<string, unknown>) => void
  http: (msg: string, meta?: Record<string, unknown>) => void
  debug: (msg: string, meta?: Record<string, unknown>) => void
  security: (msg: string, meta?: Record<string, unknown>) => void
}

export const logger: Logger
export const logRequest: (req: unknown, res: unknown, next: () => void) => void
export const logSecurityEvent: (
  event: string,
  details: Record<string, unknown>
) => void
export const logPerformance: (
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
) => void
export const logError: (error: Error, context?: Record<string, unknown>) => void
export const addRequestId: (
  req: unknown,
  res: unknown,
  next: () => void
) => void
