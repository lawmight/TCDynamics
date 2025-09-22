import { useEffect, useRef } from 'react'

/**
 * Custom hook to throttle a callback function
 * Limits the rate at which a function can fire
 *
 * @param callback - Function to throttle
 * @param delay - Throttle delay in milliseconds
 * @returns Throttled callback function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastExecutedRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const throttledCallback = ((...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastExecutedRef.current >= delay) {
      callback(...args)
      lastExecutedRef.current = now
    } else {
      // Schedule execution for the remaining time
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
        lastExecutedRef.current = Date.now()
      }, delay - (now - lastExecutedRef.current))
    }
  }) as T

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}
