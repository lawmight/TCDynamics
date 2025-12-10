import { useEffect } from 'react'

/**
 * Custom hook to prevent body scrolling when a modal/overlay is open
 * Restores scroll position when disabled
 *
 * @param isLocked - Whether to lock body scrolling
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    // Skip on server or non-DOM environments (prevents ReferenceError in tests)
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    if (!isLocked) return

    // Store current scroll position
    const scrollY = window.scrollY

    // Prevent scrolling by fixing body position
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflowY = 'scroll'

    // Restore scroll position when component unmounts or isLocked becomes false
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflowY = ''

      // Restore scroll position
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}
