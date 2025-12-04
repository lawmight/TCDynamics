/**
 * Monitoring & Error Tracking
 * Configuration pour Sentry ou solution équivalente
 */

import React from 'react'

import { logger } from '@/utils/logger'

// Sentry Types
interface SentryScope {
  setTag: (key: string, value: string) => void
  setUser: (user: { id: string }) => void
  setExtra: (key: string, value: unknown) => void
}

interface SentryInstance {
  withScope: (callback: (scope: SentryScope) => void) => void
  captureException: (error: Error) => void
  captureMessage: (
    message: string,
    level?: string,
    context?: Record<string, unknown>
  ) => void
}

interface WindowWithSentry extends Window {
  Sentry?: SentryInstance
}

interface ErrorContext {
  user?: string
  component?: string
  action?: string
  extra?: Record<string, unknown>
}

class Monitoring {
  private enabled: boolean = false
  private dsn: string | undefined

  constructor() {
    this.dsn = import.meta.env.VITE_SENTRY_DSN
    this.enabled = Boolean(this.dsn)
  }

  /**
   * Initialiser le monitoring
   */
  async init() {
    if (!this.enabled || !this.dsn) {
      return
    }

    try {
      const Sentry = await import('@sentry/browser')
      Sentry.init({
        dsn: this.dsn,
        environment: import.meta.env.MODE,
        tracesSampleRate: 0.1, // Match API configuration
        beforeSend(event, hint) {
          // Only send errors in production
          if (import.meta.env.MODE !== 'production') {
            return null
          }
          return event
        },
      })
    } catch (error) {
      logger.error("Erreur lors de l'initialisation du monitoring", error)
    }
  }

  /**
   * Capturer une erreur
   */
  captureError(error: Error, context?: ErrorContext) {
    logger.error('Error captured', { error, context })
    if (!this.enabled) return

    if (typeof window !== 'undefined') {
      const sentryWindow = window as WindowWithSentry
      if (sentryWindow.Sentry) {
        sentryWindow.Sentry.captureException(error)
      }
    }
  }

  /**
   * Capturer un message
   */
  captureMessage(message: string, level: string = 'info'): void {
    if (!this.enabled) return

    if (typeof window !== 'undefined') {
      const sentryWindow = window as WindowWithSentry
      if (sentryWindow.Sentry) {
        sentryWindow.Sentry.captureMessage(message, level)
      }
    }
  }
}

// Export singleton instance
export const monitoring = new Monitoring()

// React Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    monitoring.captureError(error, {
      component: 'ErrorBoundary',
      extra: errorInfo,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        )
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">
              Une erreur s'est produite
            </h2>
            <p className="mb-4 text-gray-600">
              Nous nous excusons pour ce désagrément.
            </p>
            <button
              onClick={this.resetError}
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Réessayer
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
