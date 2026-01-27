interface ScrollProgressBarProps {
  progress: number
  className?: string
}

/**
 * Fixed scroll progress bar at the top of the viewport.
 * - Uses scaleX transform for smooth animation
 * - Full accessibility support (progressbar role, aria attributes)
 * - Respects prefers-reduced-motion
 */
const ScrollProgressBar = ({
  progress,
  className = '',
}: ScrollProgressBarProps) => {
  const percentage = Math.round(progress * 100)

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progression de la lecture de la page"
      className={`scroll-progress-bar ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 45,
        backgroundColor: 'hsl(var(--muted) / 0.3)',
        pointerEvents: 'none',
      }}
    >
      <div
        className="scroll-progress-bar__fill"
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: 'hsl(var(--primary))',
          transformOrigin: 'left',
          transform: `scaleX(${progress})`,
          transition: 'transform 0.1s ease-out',
        }}
      />
    </div>
  )
}

export default ScrollProgressBar
