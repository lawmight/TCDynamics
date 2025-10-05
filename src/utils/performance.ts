// src/utils/performance.ts
// Performance monitoring and optimization utilities

import { logger } from './logger'

// ========== PERFORMANCE METRICS ==========

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, unknown>
}

interface ApiCallMetrics {
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

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private apiMetrics: ApiCallMetrics[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics
  private observers: Set<(metric: PerformanceMetric) => void> = new Set()

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

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Notify observers
    this.observers.forEach(observer => observer(metric))

    // Log performance metrics
    logger.info(`Performance: ${name}`, {
      duration: `${value}ms`,
      metadata,
    })
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

    // Keep only recent API metrics
    if (this.apiMetrics.length > this.maxMetrics) {
      this.apiMetrics = this.apiMetrics.slice(-this.maxMetrics)
    }

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
   * Measure execution time of a function
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
   * Measure execution time of a synchronous function
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
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
   * Add performance observer
   */
  addObserver(observer: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(observer)
    return () => this.observers.delete(observer)
  }

  /**
   * Get performance statistics
   */
  getStats(timeRangeMs: number = 300000): {
    // Last 5 minutes by default
    averageResponseTime: number
    totalRequests: number
    successRate: number
    errorRate: number
    cacheHitRate: number
    slowestEndpoints: Array<{
      endpoint: string
      avgTime: number
      count: number
    }>
  } {
    const now = Date.now()
    const recentMetrics = this.apiMetrics.filter(
      m => now - m.timestamp < timeRangeMs
    )

    if (recentMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        totalRequests: 0,
        successRate: 0,
        errorRate: 0,
        cacheHitRate: 0,
        slowestEndpoints: [],
      }
    }

    const totalRequests = recentMetrics.length
    const successfulRequests = recentMetrics.filter(m => m.success).length
    const cachedRequests = recentMetrics.filter(m => m.cached).length
    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0)

    // Group by endpoint
    const endpointStats = new Map<
      string,
      { totalTime: number; count: number }
    >()
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`
      const existing = endpointStats.get(key) || { totalTime: 0, count: 0 }
      endpointStats.set(key, {
        totalTime: existing.totalTime + metric.duration,
        count: existing.count + 1,
      })
    })

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgTime: stats.totalTime / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5)

    return {
      averageResponseTime: totalDuration / totalRequests,
      totalRequests,
      successRate: (successfulRequests / totalRequests) * 100,
      errorRate: ((totalRequests - successfulRequests) / totalRequests) * 100,
      cacheHitRate:
        totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0,
      slowestEndpoints,
    }
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): {
    general: PerformanceMetric[]
    api: ApiCallMetrics[]
    summary: ReturnType<typeof this.getStats>
  } {
    return {
      general: [...this.metrics],
      api: [...this.apiMetrics],
      summary: this.getStats(),
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.apiMetrics = []
  }
}

// ========== ENHANCED CACHE IMPLEMENTATION ==========

interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number // Size in bytes for memory management
}

interface CacheConfig {
  maxSize: number
  defaultTTL: number
  cleanupInterval: number
}

class SmartCache {
  private cache = new Map<string, CacheEntry>()
  private performanceMonitor: PerformanceMonitor
  private config: CacheConfig
  private currentSize = 0
  private lruQueue: string[] = [] // For LRU eviction

  constructor(performanceMonitor: PerformanceMonitor, config: CacheConfig) {
    this.performanceMonitor = performanceMonitor
    this.config = config

    // Start cleanup interval
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanup()
      }, this.config.cleanupInterval)
    }
  }

  /**
   * Calculate approximate size of data in bytes
   */
  private calculateSize(data: unknown): number {
    if (typeof data === 'string') {
      return data.length * 2 // UTF-16 characters
    }
    if (typeof data === 'number') {
      return 8 // 64-bit float
    }
    if (typeof data === 'boolean') {
      return 1
    }
    if (data === null || data === undefined) {
      return 0
    }
    if (Array.isArray(data)) {
      return data.reduce((sum, item) => sum + this.calculateSize(item), 0)
    }
    if (typeof data === 'object') {
      return JSON.stringify(data).length * 2
    }
    return 0
  }

  /**
   * Add key to front of LRU queue
   */
  private addToLRUQueue(key: string): void {
    this.removeFromLRUQueue(key) // Remove if exists
    this.lruQueue.unshift(key) // Add to front
  }

  /**
   * Remove key from LRU queue
   */
  private removeFromLRUQueue(key: string): void {
    const index = this.lruQueue.indexOf(key)
    if (index > -1) {
      this.lruQueue.splice(index, 1)
    }
  }

  /**
   * Evict entries if necessary to make room for new data
   */
  private evictIfNecessary(newDataSize: number): void {
    let targetSize = this.currentSize + newDataSize

    // First, evict expired entries
    this.evictExpired()

    // Then, if still over limit, evict LRU entries
    while (targetSize > this.config.maxSize && this.lruQueue.length > 0) {
      const oldestKey = this.lruQueue.pop()
      if (!oldestKey) continue
      const entry = this.cache.get(oldestKey)
      if (entry) {
        this.currentSize -= entry.size
        this.cache.delete(oldestKey)
        this.performanceMonitor.recordMetric('cache.evicted', 0, {
          key: oldestKey,
          reason: 'size_limit',
        })
      }
      targetSize = this.currentSize + newDataSize
    }
  }

  /**
   * Evict expired entries
   */
  private evictExpired(): void {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.currentSize -= entry.size
        this.cache.delete(key)
        this.removeFromLRUQueue(key)
        removed++
      }
    }

    if (removed > 0) {
      this.performanceMonitor.recordMetric('cache.evicted', 0, {
        count: removed,
        reason: 'expired',
      })
    }
  }

  set<T>(key: string, data: T, ttlMs: number = this.config.defaultTTL): void {
    // Calculate size of the data
    const dataSize = this.calculateSize(data)

    // Check if we need to evict entries (LRU + size-based eviction)
    this.evictIfNecessary(dataSize)

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: dataSize,
    }

    // Remove existing entry if present
    const existing = this.cache.get(key)
    if (existing) {
      this.currentSize -= existing.size
      this.removeFromLRUQueue(key)
    }

    this.cache.set(key, entry)
    this.currentSize += dataSize
    this.addToLRUQueue(key) // Add to front of LRU queue

    // Log cache operation
    this.performanceMonitor.recordMetric('cache.set', 0, {
      key,
      ttl: ttlMs,
      size: dataSize,
      totalSize: this.currentSize,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined

    if (!entry) {
      this.performanceMonitor.recordMetric('cache.miss', 0, { key })
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.currentSize -= entry.size
      this.cache.delete(key)
      this.removeFromLRUQueue(key)
      this.performanceMonitor.recordMetric('cache.expired', 0, { key })
      return null
    }

    // Update access statistics and LRU position
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.addToLRUQueue(key) // Move to front

    this.performanceMonitor.recordMetric('cache.hit', 0, {
      key,
      accessCount: entry.accessCount,
      age: Date.now() - entry.timestamp,
      size: entry.size,
    })

    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.currentSize -= entry.size
      this.cache.delete(key)
      this.removeFromLRUQueue(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key)
    const deleted = this.cache.delete(key)
    if (deleted && entry) {
      this.currentSize -= entry.size
      this.removeFromLRUQueue(key)
      this.performanceMonitor.recordMetric('cache.delete', 0, {
        key,
        size: entry.size,
      })
    }
    return deleted
  }

  clear(): void {
    const size = this.cache.size
    const previousTotalSize = this.currentSize
    this.cache.clear()
    this.currentSize = 0
    this.lruQueue = []
    this.performanceMonitor.recordMetric('cache.clear', 0, {
      previousSize: size,
      previousTotalSize,
    })
  }

  getStats(): {
    size: number
    hitRate: number
    totalAccesses: number
    oldestEntry: number
    newestEntry: number
    totalSize: number
    maxSize: number
    utilizationPercent: number
  } {
    const entries = Array.from(this.cache.values())
    const totalAccesses = entries.reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    )
    const totalHits = entries.filter(entry => entry.accessCount > 0).length

    const timestamps = entries.map(entry => entry.timestamp)
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : 0
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : 0

    return {
      size: this.cache.size,
      hitRate: entries.length > 0 ? (totalHits / entries.length) * 100 : 0,
      totalAccesses,
      oldestEntry,
      newestEntry,
      totalSize: this.currentSize,
      maxSize: this.config.maxSize,
      utilizationPercent:
        this.config.maxSize > 0
          ? (this.currentSize / this.config.maxSize) * 100
          : 0,
    }
  }

  // Cleanup expired entries
  cleanup(): void {
    this.evictExpired()
  }

  /**
   * Get detailed cache metrics for telemetry
   */
  getCacheMetrics() {
    const stats = this.getStats()
    const entries = Array.from(this.cache.values())

    return {
      ...stats,
      entriesByTTL: entries.reduce(
        (acc, entry) => {
          const ttlRange = this.getTTlRange(entry.ttl)
          acc[ttlRange] = (acc[ttlRange] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      averageEntrySize:
        entries.length > 0
          ? entries.reduce((sum, entry) => sum + entry.size, 0) / entries.length
          : 0,
      largestEntry:
        entries.length > 0 ? Math.max(...entries.map(entry => entry.size)) : 0,
      smallestEntry:
        entries.length > 0 ? Math.min(...entries.map(entry => entry.size)) : 0,
      entriesBySize: entries.reduce(
        (acc, entry) => {
          const sizeRange = this.getSizeRange(entry.size)
          acc[sizeRange] = (acc[sizeRange] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
    }
  }

  /**
   * Helper to categorize TTL ranges
   */
  private getTTlRange(ttl: number): string {
    if (ttl < 60000) return '< 1min'
    if (ttl < 300000) return '1-5min'
    if (ttl < 900000) return '5-15min'
    if (ttl < 3600000) return '15min-1h'
    return '> 1h'
  }

  /**
   * Helper to categorize size ranges
   */
  private getSizeRange(size: number): string {
    if (size < 100) return '< 100B'
    if (size < 1024) return '100B-1KB'
    if (size < 10240) return '1-10KB'
    if (size < 102400) return '10-100KB'
    if (size < 1048576) return '100KB-1MB'
    return '> 1MB'
  }
}

// ========== RESOURCE POOLING ==========

// ResourcePool class - Reserved for future resource management implementation if needed
/*
class ResourcePool<T> {
  private available: T[] = []
  private inUse: Set<T> = new Set()
  private createResource: () => T
  private destroyResource: (resource: T) => void
  private maxSize: number
  private performanceMonitor: PerformanceMonitor

  constructor(
    createResource: () => T,
    destroyResource: (resource: T) => void,
    maxSize: number = 10,
    performanceMonitor: PerformanceMonitor
  ) {
    this.createResource = createResource
    this.destroyResource = destroyResource
    this.maxSize = maxSize
    this.performanceMonitor = performanceMonitor
  }

  async acquire(): Promise<T> {
    return this.performanceMonitor.measureAsync(
      'resource.acquire',
      async () => {
        if (this.available.length > 0) {
          const resource = this.available.pop()
          if (!resource) throw new Error('Failed to acquire resource from pool')
          this.inUse.add(resource)
          return resource
        }

        if (this.inUse.size >= this.maxSize) {
          throw new Error('Resource pool exhausted')
        }

        const resource = this.createResource()
        this.inUse.add(resource)
        return resource
      }
    )
  }

  release(resource: T): void {
    if (this.inUse.has(resource)) {
      this.inUse.delete(resource)
      this.available.push(resource)
      this.performanceMonitor.recordMetric('resource.release', 0)
    }
  }

  getStats(): {
    available: number
    inUse: number
    total: number
  } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    }
  }

  destroy(): void {
    this.available.forEach(resource => this.destroyResource(resource))
    this.inUse.forEach(resource => this.destroyResource(resource))
    this.available = []
    this.inUse.clear()
  }
}
*/

// ========== SINGLETON INSTANCES ==========

export const performanceMonitor = new PerformanceMonitor()

// Create cache configuration from config module
const createCacheConfig = (): CacheConfig => ({
  maxSize: 1000, // Default, will be updated when config is loaded
  defaultTTL: 300000, // 5 minutes
  cleanupInterval: 300000, // 5 minutes
})

// Initialize cache with default config, will be updated when config loads
export let smartCache = new SmartCache(performanceMonitor, createCacheConfig())

// Update cache configuration when config is available
const updateCacheConfig = () => {
  try {
    // This will be called after config initialization
    if (
      typeof window !== 'undefined' &&
      (window as Window & { config?: unknown }).config
    ) {
      const config = (window as Window & { config?: unknown }).config
      const newCacheConfig: CacheConfig = {
        maxSize: config.client.VITE_CACHE_MAX_SIZE || 1000,
        defaultTTL: config.client.VITE_CACHE_DEFAULT_TTL || 300000,
        cleanupInterval: config.client.VITE_CACHE_CLEANUP_INTERVAL || 300000,
      }
      smartCache = new SmartCache(performanceMonitor, newCacheConfig)

      // Record cache configuration update
      performanceMonitor.recordMetric('cache.config.updated', 1, {
        maxSize: newCacheConfig.maxSize,
        defaultTTL: newCacheConfig.defaultTTL,
        cleanupInterval: newCacheConfig.cleanupInterval,
      })
    }
  } catch (error) {
    logger.warn('Failed to update cache configuration', { error })
    performanceMonitor.recordMetric('cache.config.update_failed', 1, {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// Auto-update cache config when config loads
if (typeof window !== 'undefined') {
  // Try immediately
  updateCacheConfig()

  // Listen for config load event
  window.addEventListener('configLoaded', updateCacheConfig)
}

// Cache telemetry utilities
export const cacheTelemetry = {
  /**
   * Report cache metrics to monitoring system
   */
  reportMetrics: () => {
    try {
      const metrics = smartCache.getCacheMetrics()
      performanceMonitor.recordMetric('cache.stats', 1, metrics)
    } catch (error) {
      performanceMonitor.recordMetric('cache.telemetry_error', 1, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  /**
   * Check cache health and report issues
   */
  healthCheck: () => {
    try {
      const stats = smartCache.getStats()

      // Check for potential issues
      const issues: string[] = []

      if (stats.utilizationPercent > 90) {
        issues.push('High memory utilization')
      }

      if (stats.hitRate < 50) {
        issues.push('Low cache hit rate')
      }

      if (stats.size > stats.maxSize * 0.8) {
        issues.push('Approaching size limit')
      }

      if (issues.length > 0) {
        performanceMonitor.recordMetric('cache.health_issues', issues.length, {
          issues: issues.join(', '),
          stats,
        })
      }

      return {
        healthy: issues.length === 0,
        issues,
        stats,
      }
    } catch (error) {
      performanceMonitor.recordMetric('cache.health_check_error', 1, {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return {
        healthy: false,
        issues: ['Health check failed'],
        stats: null,
      }
    }
  },
}

// ========== UTILITY FUNCTIONS ==========

export const performanceUtils = {
  /**
   * Debounce function calls
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  /**
   * Lazy load a module with performance tracking
   */
  lazyLoad<T>(importFn: () => Promise<T>, moduleName: string): Promise<T> {
    return performanceMonitor.measureAsync(`lazyload.${moduleName}`, importFn)
  },

  /**
   * Create a performance-tracked event handler
   */
  createTrackedHandler<T extends Event>(
    handler: (event: T) => void,
    eventName: string
  ): (event: T) => void {
    return (event: T) => {
      performanceMonitor.measure(`event.${eventName}`, () => handler(event))
    }
  },
}

// ========== BROWSER PERFORMANCE API INTEGRATION ==========

export const browserPerformance = {
  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): Promise<{
    cls?: number
    fid?: number
    lcp?: number
  }> {
    return new Promise(resolve => {
      const vitals: { cls?: number; fid?: number; lcp?: number } = {}

      // Cumulative Layout Shift
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries()
        if (entries.length > 0) {
          vitals.cls = (
            entries[entries.length - 1] as PerformanceEntry & { value: number }
          ).value
        }
      }).observe({ entryTypes: ['layout-shift'] })
      // First Input Delay
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries()
        if (entries.length > 0) {
          const firstEntry = entries[0] as PerformanceEntry & {
            processingStart: number
            startTime: number
          }
          vitals.fid = firstEntry.processingStart - firstEntry.startTime
        }
      }).observe({ entryTypes: ['first-input'] })

      // Largest Contentful Paint
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries()
        vitals.lcp = entries[entries.length - 1].startTime
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // Resolve after a short delay to collect metrics
      setTimeout(() => resolve(vitals), 100)
    })
  },

  /**
   * Get navigation timing
   */
  getNavigationTiming(): {
    dnsLookup: number
    tcpConnect: number
    serverResponse: number
    pageLoad: number
    domInteractive: number
    domContentLoaded: number
  } {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming

    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      serverResponse: navigation.responseEnd - navigation.requestStart,
      pageLoad: navigation.loadEventEnd - navigation.loadEventStart,
      domInteractive:
        navigation.domInteractive - navigation.domContentLoadedEventStart,
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
    }
  },
}
