// src/utils/performance-timers.ts
// Optimized timer management utilities to prevent memory leaks

interface TimerManager {
  setTimeout: (callback: () => void, delay: number) => number
  setInterval: (callback: () => void, delay: number) => number
  clearTimeout: (id: number) => void
  clearInterval: (id: number) => void
  clearAll: () => void
}

class OptimizedTimerManager implements TimerManager {
  private timeouts = new Set<number>()
  private intervals = new Set<number>()

  setTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(() => {
      this.timeouts.delete(id)
      callback()
    }, delay)
    
    this.timeouts.add(id)
    return id
  }

  setInterval(callback: () => void, delay: number): number {
    const id = window.setInterval(callback, delay)
    this.intervals.add(id)
    return id
  }

  clearTimeout(id: number): void {
    window.clearTimeout(id)
    this.timeouts.delete(id)
  }

  clearInterval(id: number): void {
    window.clearInterval(id)
    this.intervals.delete(id)
  }

  clearAll(): void {
    // Clear all timeouts
    this.timeouts.forEach(id => {
      window.clearTimeout(id)
    })
    this.timeouts.clear()

    // Clear all intervals
    this.intervals.forEach(id => {
      window.clearInterval(id)
    })
    this.intervals.clear()
  }

  getStats(): { timeouts: number; intervals: number } {
    return {
      timeouts: this.timeouts.size,
      intervals: this.intervals.size,
    }
  }
}

// Global timer manager instance
export const timerManager = new OptimizedTimerManager()

// React hook for managing timers
export function useTimerManager() {
  return {
    setTimeout: timerManager.setTimeout.bind(timerManager),
    setInterval: timerManager.setInterval.bind(timerManager),
    clearTimeout: timerManager.clearTimeout.bind(timerManager),
    clearInterval: timerManager.clearInterval.bind(timerManager),
    clearAll: timerManager.clearAll.bind(timerManager),
  }
}

// Utility functions for common timer patterns
export const createDebouncedFunction = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  manager: TimerManager = timerManager
): T => {
  let timeoutId: number | null = null

  return ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      manager.clearTimeout(timeoutId)
    }

    timeoutId = manager.setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }) as T
}

export const createThrottledFunction = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  manager: TimerManager = timerManager
): T => {
  let timeoutId: number | null = null
  let lastExecuted = 0

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastExecuted >= delay) {
      func(...args)
      lastExecuted = now
    } else if (timeoutId === null) {
      timeoutId = manager.setTimeout(() => {
        func(...args)
        lastExecuted = Date.now()
        timeoutId = null
      }, delay - (now - lastExecuted))
    }
  }) as T
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    timerManager.clearAll()
  })
}