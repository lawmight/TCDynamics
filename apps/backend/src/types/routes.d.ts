/**
 * Type definitions for route modules
 * These types help ensure consistency across route handlers
 */

import { Request, Response, NextFunction } from 'express'

/**
 * Standard route handler type
 */
export type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>

/**
 * Async route handler type
 */
export type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

/**
 * Error handler type
 */
export type ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void

/**
 * Middleware type
 */
export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>

/**
 * Request with raw body (for webhook verification)
 */
export interface RequestWithRawBody extends Request {
  rawBody?: Buffer
}

/**
 * Response with CSRF token in locals
 */
export interface ResponseWithCsrf extends Response {
  locals: {
    csrfToken?: string
    [key: string]: unknown
  }
}

