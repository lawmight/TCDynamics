import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  resetCount: number
}

interface PerformanceMonitor {
  recordMetric: (
    name: string,
    value: number,
    metadata?: Record<string, unknown>
  ) => void
}

interface WindowWithPerformanceMonitor extends Window {
  performanceMonitor?: PerformanceMonitor
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, resetCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // Reset error state if resetKeys changed
    if (hasError && resetKeys && resetOnPropsChange !== false) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, index) => prevProps.resetKeys?.[index] !== resetKey
      )

      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Handle error without console logging for production
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to monitoring service
    if (
      typeof window !== 'undefined' &&
      (window as WindowWithPerformanceMonitor).performanceMonitor
    ) {
      ;(window as WindowWithPerformanceMonitor).performanceMonitor.recordMetric(
        'error.boundary',
        1,
        {
          error: error.message,
          componentStack: errorInfo.componentStack,
        }
      )
    }
  }

  resetErrorBoundary = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      resetCount: prevState.resetCount + 1,
    }))

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset()
    }

    // Clear any pending timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }
  }

  handleRetry = () => {
    this.resetErrorBoundary()
  }

  handleReload = () => {
    window.location.reload()
  }

  handleResetWithDelay = () => {
    // Set a timeout to automatically reset after 5 seconds
    this.resetTimeoutId = setTimeout(() => {
      this.resetErrorBoundary()
    }, 5000)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Auto-reset after 5 seconds
      this.handleResetWithDelay()

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-destructive/20 rounded-lg p-6 text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            <h1 className="text-xl font-semibold text-foreground mb-2">
              Quelque chose s'est mal passé
            </h1>

            <p className="text-muted-foreground mb-2">
              Une erreur inattendue s'est produite. Nos équipes ont été
              notifiées.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Tentative de récupération automatique dans 5 secondes...
            </p>

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer maintenant
              </Button>

              <Button
                onClick={this.handleReload}
                className="w-full"
                variant="outline"
              >
                Recharger la page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Détails de l'erreur (développement)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
