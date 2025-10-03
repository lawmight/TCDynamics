// src/utils/performance-optimized.ts
// Performance monitoring with sampling and optimization features

import { performanceMonitor, smartCache } from './performance'

interface SamplingConfig {
  enableSampling: boolean
  sampleRate: number // 0.0 to 1.0
  excludedPatterns?: string[]
}

class OptimizedPerformanceMonitor {
  private samplingConfig: SamplingConfig
  private sessionId: string

  constructor(samplingConfig: SamplingConfig) {
    this.samplingConfig = samplingConfig
    this.sessionId = this.generateSessionId()
  }

  /**
   * Check if we should sample this event based on configuration
   */
  private shouldSample(eventName: string): boolean {
    if (!this.samplingConfig.enableSampling) {
      return true
    }

    // Check excluded patterns
    if (this.samplingConfig.excludedPatterns) {
      const isExcluded = this.samplingConfig.excludedPatterns.some(pattern =>
        eventName.includes(pattern)
      )
      if (isExcluded) {
        return true // Always include excluded events
      }
    }

    // Apply sampling rate
    return Math.random() < this.samplingConfig.sampleRate
  }

  /**
   * Record a performance metric with optional sampling
   */
  recordMetric(
    name: string,
    value: number,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.shouldSample(name)) {
      return // Skip sampling
    }

    // Add session ID and sampling info to metadata
    const enhancedMetadata = {
      ...metadata,
      sessionId: this.sessionId,
      sampled: this.samplingConfig.enableSampling,
      sampleRate: this.samplingConfig.sampleRate,
    }

    performanceMonitor.recordMetric(name, value, enhancedMetadata)
  }

  /**
   * Record API call with performance monitoring
   */
  recordApiCall(
    metrics: Omit<import('./performance').ApiCallMetrics, 'timestamp'>
  ): void {
    if (!this.shouldSample(`api.${metrics.endpoint}`)) {
      return // Skip sampling
    }

    performanceMonitor.recordApiCall({
      ...metrics,
      metadata: {
        ...metrics.metadata,
        sessionId: this.sessionId,
        sampled: true,
      },
    })
  }

  /**
   * Get performance statistics with sampling consideration
   */
  getStats(timeRangeMs: number = 300000) {
    const baseStats = performanceMonitor.getStats(timeRangeMs)

    return {
      ...baseStats,
      sampling: {
        enabled: this.samplingConfig.enableSampling,
        rate: this.samplingConfig.sampleRate,
        sessionId: this.sessionId,
      },
      // Adjust total requests based on sampling rate
      adjustedTotalRequests: this.samplingConfig.enableSampling
        ? Math.round(baseStats.totalRequests / this.samplingConfig.sampleRate)
        : baseStats.totalRequests,
    }
  }

  /**
   * Generate a session ID for tracking
   */
  private generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    // Fallback for older browsers
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  /**
   * Update sampling configuration
   */
  updateSamplingConfig(config: Partial<SamplingConfig>): void {
    this.samplingConfig = { ...this.samplingConfig, ...config }
  }
}

// Create optimized monitor instance
const createOptimizedMonitor = (): OptimizedPerformanceMonitor => {
  const config = {
    enableSampling: true,
    sampleRate: 0.1, // 10% by default
    excludedPatterns: ['error.', 'security.', 'cache.evicted'], // Always track these
  }

  return new OptimizedPerformanceMonitor(config)
}

export const optimizedPerformanceMonitor = createOptimizedMonitor()

// Export cache with optimized access
export const optimizedCache = {
  get: <T>(key: string): T | null => smartCache.get(key),
  set: <T>(key: string, data: T, ttlMs?: number): void => {
    smartCache.set(key, data, ttlMs)
  },
  has: (key: string): boolean => smartCache.has(key),
  delete: (key: string): boolean => smartCache.delete(key),
  clear: (): void => smartCache.clear(),
  getStats: () => smartCache.getStats(),
}

// Utility for lazy loading with performance tracking
export const lazyLoadWithTracking = {
  /**
   * Lazy load a module with performance tracking
   */
  module: async <T>(
    importFn: () => Promise<T>,
    moduleName: string
  ): Promise<T> => {
    const startTime = performance.now()

    try {
      const module = await importFn()
      const loadTime = performance.now() - startTime

      optimizedPerformanceMonitor.recordMetric('lazyload.module', loadTime, {
        moduleName,
        success: true,
      })

      return module
    } catch (error) {
      const loadTime = performance.now() - startTime

      optimizedPerformanceMonitor.recordMetric('lazyload.module', loadTime, {
        moduleName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  },

  /**
   * Lazy load a component with performance tracking
   */
  component: async <T>(
    importFn: () => Promise<{ default: T }>,
    componentName: string
  ): Promise<T> => {
    const startTime = performance.now()

    try {
      const module = await importFn()
      const loadTime = performance.now() - startTime

      optimizedPerformanceMonitor.recordMetric('lazyload.component', loadTime, {
        componentName,
        success: true,
      })

      return module.default
    } catch (error) {
      const loadTime = performance.now() - startTime

      optimizedPerformanceMonitor.recordMetric('lazyload.component', loadTime, {
        componentName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  },
}

// Performance utilities with optimization
export const optimizedPerformanceUtils = {
  /**
   * Debounce function calls with performance tracking
   */
  debounce: <T extends (...args: never[]) => unknown>(
    func: T,
    wait: number,
    options?: { leading?: boolean; trailing?: boolean }
  ): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastArgs: Parameters<T> | null = null
    let lastInvokeTime = 0
    const leading = options?.leading ?? false
    const trailing = options?.trailing ?? true

    const invokeFunc = (time: number) => {
      if (lastArgs) {
        lastInvokeTime = time
        func(...lastArgs)
      }
    }

    const cancel = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const debounced = (...args: Parameters<T>) => {
      const time = Date.now()
      const isInvoking = leading && time - lastInvokeTime >= wait

      lastArgs = args

      if (isInvoking) {
        invokeFunc(time)
        return
      }

      if (trailing) {
        if (timeoutId === null) {
          timeoutId = setTimeout(
            () => invokeFunc(time),
            wait - (time - lastInvokeTime)
          )
        }
      }
    }

    debounced.cancel = cancel
    return debounced
  },

  /**
   * Throttle function calls with performance tracking
   */
  throttle: <T extends (...args: never[]) => unknown>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle = false

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },
}

// Export original functions for backward compatibility
export { performanceMonitor, smartCache }
