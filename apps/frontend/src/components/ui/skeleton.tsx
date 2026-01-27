import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Animation delay in milliseconds for stagger effects.
   * Applied as animation-delay (not transition-delay).
   */
  delay?: number
}

/**
 * Skeleton primitive component for loading states
 *
 * Features:
 * - Uses animate-pulse with bg-muted (existing pattern)
 * - Supports prefers-reduced-motion via CSS
 * - Accessible via role="presentation" (decorative)
 * - Optional delay prop for stagger animations
 */
function Skeleton({ className, delay, style, ...props }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded bg-muted',
        // motion-reduce ensures animation respects prefers-reduced-motion
        'motion-reduce:animate-none',
        className
      )}
      style={{
        ...style,
        ...(delay ? { animationDelay: `${delay}ms` } : {}),
      }}
      {...props}
    />
  )
}

export { Skeleton }
export type { SkeletonProps }
