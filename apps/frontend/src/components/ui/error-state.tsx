import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import AlertCircle from '~icons/lucide/alert-circle'

type ErrorStateVariant = 'inline' | 'card' | 'fullpage'

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  title?: string
  variant?: ErrorStateVariant
  retryLabel?: string
  onRetry?: () => void
}

function ErrorStateContent({
  message,
  title = 'Une erreur est survenue',
  retryLabel = 'Réessayer',
  onRetry,
}: Pick<ErrorStateProps, 'message' | 'title' | 'retryLabel' | 'onRetry'>) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <AlertCircle className="size-5" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function ErrorState({
  className,
  message,
  title,
  variant = 'card',
  retryLabel,
  onRetry,
  ...props
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive',
          className
        )}
        {...props}
      >
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-2">
          <p>{message}</p>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              {retryLabel ?? 'Réessayer'}
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  const content = (
    <Card className={cn('border-destructive/20 bg-destructive/5', className)}>
      <CardContent className="px-6 py-8">
        <ErrorStateContent
          message={message}
          title={title}
          retryLabel={retryLabel}
          onRetry={onRetry}
        />
      </CardContent>
    </Card>
  )

  if (variant === 'fullpage') {
    return (
      <div
        role="alert"
        className="flex min-h-[40vh] items-center justify-center"
        {...props}
      >
        {content}
      </div>
    )
  }

  return (
    <div role="alert" {...props}>
      {content}
    </div>
  )
}

export default ErrorState
