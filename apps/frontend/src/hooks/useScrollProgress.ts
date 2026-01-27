import { useEffect, useState } from 'react'

/**
 * Hook that calculates scroll progress (0–1) using requestAnimationFrame for throttling.
 * @returns { progress: number } bounded 0–1
 */
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number | null = null
    let ticking = false

    const calculateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const innerHeight = window.innerHeight
      const scrollY = window.scrollY

      // Handle edge case when there's no scrollable content
      if (scrollHeight <= innerHeight) {
        setProgress(0)
        return
      }

      const maxScroll = scrollHeight - innerHeight
      const newProgress = Math.min(1, Math.max(0, scrollY / maxScroll))
      setProgress(newProgress)
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(calculateProgress)
        ticking = true
      }
    }

    // Calculate initial progress on mount
    calculateProgress()

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return { progress }
}
