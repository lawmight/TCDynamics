import * as React from 'react'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import Loader2 from '~icons/lucide/loader-2'

type LoadingStateVariant = 'spinner' | 'dots' | 'skeleton'
type LoadingSkeletonPreset = 'cards' | 'panel' | 'list'

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LoadingStateVariant
  label?: string
  preset?: LoadingSkeletonPreset
  count?: number
}

export function LoadingState({
  className,
  variant = 'spinner',
  label = 'Chargement…',
  preset = 'panel',
  count = 3,
  ...props
}: LoadingStateProps) {
  if (variant === 'dots') {
    return (
      <div
        role="status"
        aria-label={label}
        className={cn('flex items-center gap-1.5', className)}
        {...props}
      >
        <span className="bg-muted-foreground/50 size-2 animate-bounce rounded-full [animation-delay:0ms]" />
        <span className="bg-muted-foreground/50 size-2 animate-bounce rounded-full [animation-delay:150ms]" />
        <span className="bg-muted-foreground/50 size-2 animate-bounce rounded-full [animation-delay:300ms]" />
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  if (variant === 'skeleton') {
    if (preset === 'cards') {
      return (
        <div
          role="status"
          aria-label={label}
          className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4', className)}
          {...props}
        >
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={`loading-card-${index}`}
              className="rounded-lg border bg-card p-5"
            >
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" delay={index * 50} />
                <Skeleton className="h-8 w-20" delay={index * 50 + 25} />
                <Skeleton className="h-3 w-28" delay={index * 50 + 50} />
              </div>
            </div>
          ))}
          <span className="sr-only">{label}</span>
        </div>
      )
    }

    if (preset === 'list') {
      return (
        <div
          role="status"
          aria-label={label}
          className={cn('space-y-3', className)}
          {...props}
        >
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={`loading-row-${index}`}
              className="rounded-lg border bg-card p-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-lg" delay={index * 50} />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" delay={index * 50 + 25} />
                    <Skeleton className="h-3 w-24" delay={index * 50 + 50} />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" delay={index * 50 + 75} />
              </div>
            </div>
          ))}
          <span className="sr-only">{label}</span>
        </div>
      )
    }

    return (
      <div
        role="status"
        aria-label={label}
        className={cn('space-y-4', className)}
        {...props}
      >
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" delay={50} />
        <Skeleton className="h-64 w-full rounded-xl" delay={100} />
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center',
        className
      )}
      {...props}
    >
      <Loader2 className="text-primary size-8 animate-spin" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export default LoadingState
