/**
 * Monitoring & Error Tracking
 * Configuration pour Sentry ou solution équivalente
 */

interface ErrorContext {
  user?: string
  component?: string
  action?: string
  extra?: Record<string, any>
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
      // Monitoring disabled in production
      return
    }

    try {
      // Lazy load Sentry uniquement si nécessaire
      const Sentry = await import('@sentry/react')
      
      Sentry.init({
        dsn: this.dsn,
        environment: import.meta.env.MODE,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true, // RGPD: Masquer le texte sensible
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend(event) {
          // Filtrer les informations sensibles
          if (event.request?.cookies) {
            delete event.request.cookies
          }
          return event
        }
      })

      // Monitoring initialized
    } catch (error) {
      // Error initializing monitoring
    }
  }

  /**
   * Capturer une erreur
   */
  captureError(error: Error, context?: ErrorContext) {
    // Error captured for monitoring

    if (!this.enabled) return

    // Si Sentry est chargé
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry
      
      Sentry.withScope((scope: any) => {
        if (context?.component) {
          scope.setTag('component', context.component)
        }
        if (context?.action) {
          scope.setTag('action', context.action)
        }
        if (context?.user) {
          scope.setUser({ id: context.user })
        }
        if (context?.extra) {
          scope.setContext('extra', context.extra)
        }
        
        Sentry.captureException(error)
      })
    }
  }

  /**
   * Capturer un message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    // Message captured for monitoring

    if (!this.enabled) return

    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(message, level)
    }
  }

  /**
   * Mesurer les performances
   */
  measurePerformance(name: string, fn: () => void | Promise<void>) {
    const start = performance.now()
    
    const complete = () => {
      const duration = performance.now() - start
      
      if (duration > 1000) {
        this.captureMessage(
          `Performance warning: ${name} took ${duration.toFixed(2)}ms`,
          'warning'
        )
      }

      // Log en dev
      if (import.meta.env.DEV) {
        // Performance metric: ${name}: ${duration.toFixed(2)}ms
      }
    }

    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(complete)
    } else {
      complete()
      return result
    }
  }

  /**
   * Tracker les Web Vitals
   */
  trackWebVitals() {
    if (!this.enabled) return

    // Utiliser web-vitals library
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS((metric) => this.logMetric('CLS', metric.value))
      onFID((metric) => this.logMetric('FID', metric.value))
      onFCP((metric) => this.logMetric('FCP', metric.value))
      onLCP((metric) => this.logMetric('LCP', metric.value))
      onTTFB((metric) => this.logMetric('TTFB', metric.value))
    })
  }

  private logMetric(name: string, value: number) {
    if (import.meta.env.DEV) {
      // Web Vital metric: ${name}: ${value.toFixed(2)}
    }

    // Envoyer à Sentry si disponible
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(
        `WebVital:${name}`,
        'info',
        { extra: { value } }
      )
    }
  }
}

export const monitoring = new Monitoring()

// React Error Boundary pour capturer les erreurs
import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    monitoring.captureError(error, {
      component: errorInfo.componentStack || 'Unknown',
      extra: { errorInfo }
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Oops! Une erreur est survenue
            </h1>
            <p className="text-muted-foreground mb-6">
              Nous avons été notifiés et travaillons sur le problème.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Recharger la page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}