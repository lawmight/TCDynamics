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
    >
      <div
        className="scroll-progress-bar__fill"
        style={{
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  )
}

export default ScrollProgressBar
