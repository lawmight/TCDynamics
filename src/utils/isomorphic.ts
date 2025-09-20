// src/utils/isomorphic.ts
// Utilities for handling browser vs Node.js compatibility

/**
 * Check if we're running in a browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Check if we're running in a Node.js environment
 */
export const isNode = (): boolean => {
  return typeof process !== 'undefined' &&
         typeof process.versions !== 'undefined' &&
         typeof process.versions.node !== 'undefined'
}

/**
 * Check if we're running in a web worker
 */
export const isWebWorker = (): boolean => {
  return typeof self !== 'undefined' &&
         typeof importScripts !== 'undefined' &&
         !isBrowser()
}

/**
 * Check if we're in a development environment
 */
export const isDevelopment = (): boolean => {
  if (isBrowser()) {
    return import.meta.env?.DEV === true || import.meta.env?.MODE === 'development'
  }

  if (isNode()) {
    return process.env.NODE_ENV === 'development'
  }

  return false
}

/**
 * Check if we're in a production environment
 */
export const isProduction = (): boolean => {
  if (isBrowser()) {
    return import.meta.env?.PROD === true || import.meta.env?.MODE === 'production'
  }

  if (isNode()) {
    return process.env.NODE_ENV === 'production'
  }

  return false
}

/**
 * Check if we're in a test environment
 */
export const isTest = (): boolean => {
  if (isBrowser()) {
    return import.meta.env?.MODE === 'test'
  }

  if (isNode()) {
    return process.env.NODE_ENV === 'test' ||
           process.env.JEST_WORKER_ID !== undefined ||
           process.env.VITEST === 'true'
  }

  return false
}

/**
 * Get environment-specific value
 */
export const getEnvironmentValue = <T>(
  browserValue: T,
  nodeValue: T,
  defaultValue: T
): T => {
  if (isBrowser()) return browserValue
  if (isNode()) return nodeValue
  return defaultValue
}

/**
 * Browser-compatible crypto utilities
 */
export const cryptoUtils = {
  /**
   * Generate a random UUID (browser and Node.js compatible)
   */
  randomUUID: (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  /**
   * Generate random bytes (browser and Node.js compatible)
   */
  randomBytes: (length: number): Uint8Array => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(length)
      crypto.getRandomValues(array)
      return array
    }

    // Fallback for environments without crypto.getRandomValues
    const array = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
    return array
  },

  /**
   * Create a hash of a string (browser and Node.js compatible)
   */
  hashString: async (input: string): Promise<string> => {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    // Fallback implementation using Web Crypto API simulation
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  },
}

/**
 * Storage utilities that work across environments
 */
export const storageUtils = {
  /**
   * Get item from storage (localStorage in browser, memory in Node.js)
   */
  getItem: (key: string): string | null => {
    if (isBrowser() && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    }

    // In-memory storage for Node.js/testing
    return (globalThis as any).__MEMORY_STORAGE__?.[key] || null
  },

  /**
   * Set item in storage
   */
  setItem: (key: string, value: string): void => {
    if (isBrowser() && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value)
      } catch {
        // Ignore storage errors
      }
    } else {
      // In-memory storage for Node.js/testing
      if (!(globalThis as any).__MEMORY_STORAGE__) {
        (globalThis as any).__MEMORY_STORAGE__ = {}
      }
      (globalThis as any).__MEMORY_STORAGE__[key] = value
    }
  },

  /**
   * Remove item from storage
   */
  removeItem: (key: string): void => {
    if (isBrowser() && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore storage errors
      }
    } else {
      // In-memory storage for Node.js/testing
      if ((globalThis as any).__MEMORY_STORAGE__) {
        delete (globalThis as any).__MEMORY_STORAGE__[key]
      }
    }
  },
}

/**
 * Timer utilities that work across environments
 */
export const timerUtils = {
  /**
   * Set timeout that works in browser and Node.js
   */
  setTimeout: (callback: () => void, delay: number): NodeJS.Timeout | number => {
    if (isNode() && typeof global !== 'undefined' && global.setTimeout) {
      return global.setTimeout(callback, delay)
    }

    if (isBrowser() && typeof window !== 'undefined' && window.setTimeout) {
      return window.setTimeout(callback, delay)
    }

    // Fallback
    return setTimeout(callback, delay) as any
  },

  /**
   * Clear timeout that works across environments
   */
  clearTimeout: (timeoutId: NodeJS.Timeout | number): void => {
    if (isNode() && typeof global !== 'undefined' && global.clearTimeout) {
      global.clearTimeout(timeoutId as NodeJS.Timeout)
    } else if (isBrowser() && typeof window !== 'undefined' && window.clearTimeout) {
      window.clearTimeout(timeoutId as number)
    } else {
      clearTimeout(timeoutId as any)
    }
  },

  /**
   * Set interval that works across environments
   */
  setInterval: (callback: () => void, delay: number): NodeJS.Timeout | number => {
    if (isNode() && typeof global !== 'undefined' && global.setInterval) {
      return global.setInterval(callback, delay)
    }

    if (isBrowser() && typeof window !== 'undefined' && window.setInterval) {
      return window.setInterval(callback, delay)
    }

    // Fallback
    return setInterval(callback, delay) as any
  },

  /**
   * Clear interval that works across environments
   */
  clearInterval: (intervalId: NodeJS.Timeout | number): void => {
    if (isNode() && typeof global !== 'undefined' && global.clearInterval) {
      global.clearInterval(intervalId as NodeJS.Timeout)
    } else if (isBrowser() && typeof window !== 'undefined' && window.clearInterval) {
      window.clearInterval(intervalId as number)
    } else {
      clearInterval(intervalId as any)
    }
  },
}

/**
 * Performance utilities that work across environments
 */
export const performanceUtils = {
  /**
   * Get current time in milliseconds (high resolution)
   */
  now: (): number => {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now()
    }

    if (isNode() && typeof process !== 'undefined' && process.hrtime) {
      const [seconds, nanoseconds] = process.hrtime()
      return seconds * 1000 + nanoseconds / 1000000
    }

    return Date.now()
  },

  /**
   * Mark a performance measurement
   */
  mark: (name: string): void => {
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(name)
      } catch {
        // Ignore performance.mark errors
      }
    }
  },

  /**
   * Measure performance between two marks
   */
  measure: (name: string, startMark: string, endMark: string): void => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark)
      } catch {
        // Ignore performance.measure errors
      }
    }
  },
}

/**
 * Console utilities with environment-aware logging
 */
export const consoleUtils = {
  /**
   * Log message only in development
   */
  devLog: (...args: any[]): void => {
    if (isDevelopment()) {
      console.log('[DEV]', ...args)
    }
  },

  /**
   * Log warning only in development
   */
  devWarn: (...args: any[]): void => {
    if (isDevelopment()) {
      console.warn('[DEV]', ...args)
    }
  },

  /**
   * Log error with additional context
   */
  error: (error: Error | string, context?: Record<string, any>): void => {
    const errorMessage = error instanceof Error ? error.message : error
    const contextInfo = context ? ` Context: ${JSON.stringify(context)}` : ''

    console.error(`[ERROR] ${errorMessage}${contextInfo}`)

    // In browser, also log to monitoring if available
    if (isBrowser() && typeof window !== 'undefined' && (window as any).performanceMonitor) {
      (window as any).performanceMonitor.recordMetric('error.runtime', 1, {
        error: errorMessage,
        context,
        environment: isBrowser() ? 'browser' : isNode() ? 'node' : 'unknown',
      })
    }
  },

  /**
   * Log performance metrics
   */
  perf: (name: string, duration: number, metadata?: Record<string, any>): void => {
    if (isDevelopment()) {
      console.log(`[PERF] ${name}: ${duration}ms`, metadata || '')
    }
  },
}
