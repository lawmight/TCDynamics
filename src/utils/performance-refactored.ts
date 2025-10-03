// src/utils/performance-refactored.ts
// Refactored performance monitoring and optimization utilities

import { config } from './config'
import { SmartCache } from './cache/SmartCache'
import { ResourcePool } from './cache/ResourcePool'

// ========== TYPE DEFINITIONS ==========

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface ApiCallMetrics {
  endpoint: string
  method: string
  duration: number
  statusCode: number
  success: boolean
  cached: boolean
  timestamp: number
  retryCount: number
  errorType?: string
}

export interface PerformanceStats {
  totalMetrics: number
  averageResponseTime: number
  errorRate: number
  cacheHitRate: number
  memoryUsage: number
}

// ========== PERFORMANCE MONITOR ==========

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private apiMetrics: ApiCallMetrics[] = []
  private readonly maxMetrics = 1000
  private readonly observers = new Set<(metric: PerformanceMetric) => void>()

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    }

    this.addMetric(metric)
    this.notifyObservers(metric)
    this.logMetric(metric)
  }

  /**
   * Record API call performance
   */
  recordApiCall(metrics: Omit<ApiCallMetrics, 'timestamp'>): void {
    const apiMetric: ApiCallMetrics = {
      ...metrics,
      timestamp: Date.now(),
    }

    this.apiMetrics.push(apiMetric)
    this.trimMetrics()

    // Record as general performance metric
    this.recordMetric(`api.${metrics.endpoint}`, metrics.duration, {
      method: metrics.method,
      statusCode: metrics.statusCode,
      success: metrics.success,
      cached: metrics.cached,
      retryCount: metrics.retryCount,
      errorType: metrics.errorType,
    })
  }

  /**
   * Measure execution time of an async function
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, { ...metadata, success: true })
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(name, duration, {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Measure execution time of a sync function
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): T {
    const start = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, { ...metadata, success: true })
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(name, duration, {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    const totalMetrics = this.metrics.length
    const apiMetrics = this.apiMetrics

    const averageResponseTime = apiMetrics.length > 0
      ? apiMetrics.reduce((sum, metric) => sum + metric.duration, 0) / apiMetrics.length
      : 0

    const errorRate = apiMetrics.length > 0
      ? apiMetrics.filter(metric => !metric.success).length / apiMetrics.length
      : 0

    const cacheHitRate = apiMetrics.length > 0
      ? apiMetrics.filter(metric => metric.cached).length / apiMetrics.length
      : 0

    const memoryUsage = this.calculateMemoryUsage()

    return {
      totalMetrics,
      averageResponseTime,
      errorRate,
      cacheHitRate,
      memoryUsage,
    }
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name)
  }

  /**
   * Get recent API metrics
   */
  getRecentApiMetrics(limit: number = 100): ApiCallMetrics[] {
    return this.apiMetrics.slice(-limit)
  }

  /**
   * Subscribe to metric events
   */
  subscribe(observer: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(observer)
    return () => this.observers.delete(observer)
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.length = 0
    this.apiMetrics.length = 0
  }

  // Private methods

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    this.trimMetrics()
  }

  private trimMetrics(): void {
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
    if (this.apiMetrics.length > this.maxMetrics) {
      this.apiMetrics = this.apiMetrics.slice(-this.maxMetrics)
    }
  }

  private notifyObservers(metric: PerformanceMetric): void {
    this.observers.forEach(observer => {
      try {
        observer(metric)
      } catch (error) {
        // Silently handle observer errors to prevent breaking the monitoring system
      }
    })
  }

  private logMetric(metric: PerformanceMetric): void {
    if (config.isDevelopment && config.client.VITE_ENABLE_DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log(`[PERF] ${metric.name}: ${metric.value}ms`, metric.metadata)
    }
  }

  private calculateMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }
}

// ========== CACHE MANAGEMENT ==========

export class CacheManager {
  private smartCache: SmartCache
  private performanceMonitor: PerformanceMonitor

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor
    this.smartCache = new SmartCache(performanceMonitor, {
      maxSize: config.client.VITE_CACHE_MAX_SIZE || 50 * 1024 * 1024, // 50MB
      defaultTTL: config.client.VITE_CACHE_DEFAULT_TTL || 300000, // 5 minutes
      cleanupInterval: config.client.VITE_CACHE_CLEANUP_INTERVAL || 60000, // 1 minute
    })
  }

  get<T>(key: string): T | null {
    return this.smartCache.get<T>(key)
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.smartCache.set(key, data, ttl)
  }

  delete(key: string): boolean {
    return this.smartCache.delete(key)
  }

  clear(): void {
    this.smartCache.clear()
  }

  getStats() {
    return this.smartCache.getStats()
  }
}

// ========== RESOURCE MANAGEMENT ==========

export class ResourceManager {
  private pools = new Map<string, ResourcePool<unknown>>()
  private performanceMonitor: PerformanceMonitor

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor
  }

  createPool<T>(
    name: string,
    createResource: () => T,
    destroyResource: (resource: T) => void,
    maxSize: number = 10
  ): ResourcePool<T> {
    const pool = new ResourcePool(createResource, destroyResource, maxSize, this.performanceMonitor)
    this.pools.set(name, pool as ResourcePool<unknown>)
    return pool
  }

  getPool<T>(name: string): ResourcePool<T> | undefined {
    return this.pools.get(name) as ResourcePool<T> | undefined
  }

  destroyPool(name: string): void {
    const pool = this.pools.get(name)
    if (pool) {
      pool.destroy()
      this.pools.delete(name)
    }
  }

  getPoolStats(name: string) {
    const pool = this.pools.get(name)
    return pool ? pool.getStats() : null
  }
}

// ========== INSTANCES ==========

export const performanceMonitor = new PerformanceMonitor()
export const cacheManager = new CacheManager(performanceMonitor)
export const resourceManager = new ResourceManager(performanceMonitor)

// Legacy exports for backward compatibility
export const smartCache = cacheManager
export const resourcePool = resourceManager

// ========== UTILITY FUNCTIONS ==========

/**
 * Debounce function with performance monitoring
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  name?: string
): T {
  let timeout: NodeJS.Timeout | null = null

  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      if (name) {
        performanceMonitor.measureSync(name, () => func(...args))
      } else {
        func(...args)
      }
    }, wait)
  }) as T
}

/**
 * Throttle function with performance monitoring
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
  name?: string
): T {
  let inThrottle = false

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      if (name) {
        performanceMonitor.measureSync(name, () => func(...args))
      } else {
        func(...args)
      }
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}

/**
 * Retry function with exponential backoff and performance monitoring
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    delay?: number
    backoff?: number
    name?: string
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2, name = 'retry' } = options

  let lastError: Error

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (name) {
        return await performanceMonitor.measureAsync(name, fn, { attempt })
      } else {
        return await fn()
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt === retries) {
        performanceMonitor.recordMetric(`${name}.failed`, attempt + 1, {
          error: lastError.message,
        })
        throw lastError
      }

      const waitTime = delay * Math.pow(backoff, attempt)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError!
}