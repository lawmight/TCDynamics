// src/utils/cache/SmartCache.ts
// Smart caching system with LRU eviction and performance monitoring

import { PerformanceMonitor } from '../performance'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
  size: number
  accessCount: number
  lastAccessed: number
}

interface CacheConfig {
  maxSize: number
  defaultTTL: number
  cleanupInterval: number
}

export class SmartCache {
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
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return 1024 // Default size if calculation fails
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * Update LRU queue when accessing an item
   */
  private updateLRU(key: string): void {
    const index = this.lruQueue.indexOf(key)
    if (index > -1) {
      this.lruQueue.splice(index, 1)
    }
    this.lruQueue.unshift(key)
  }

  /**
   * Evict expired entries
   */
  private evictExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.currentSize -= entry.size
        this.cache.delete(key)
        const lruIndex = this.lruQueue.indexOf(key)
        if (lruIndex > -1) {
          this.lruQueue.splice(lruIndex, 1)
        }
        this.performanceMonitor.recordMetric('cache.evicted', 0, {
          reason: 'expired',
          key,
        })
      }
    }
  }

  /**
   * Evict LRU entries to make room
   */
  private evictLRU(targetSize: number): void {
    // First, evict expired entries
    this.evictExpired()

    // Then, if still over limit, evict LRU entries
    while (targetSize > this.config.maxSize && this.lruQueue.length > 0) {
      const oldestKey = this.lruQueue.pop()
      if (!oldestKey) break
      const entry = this.cache.get(oldestKey)
      if (entry) {
        this.currentSize -= entry.size
        this.cache.delete(oldestKey)
        this.performanceMonitor.recordMetric('cache.evicted', 0, {
          reason: 'lru',
          key: oldestKey,
        })
      }
    }
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.performanceMonitor.recordMetric('cache.miss', 0, { key })
      return null
    }

    if (this.isExpired(entry)) {
      this.currentSize -= entry.size
      this.cache.delete(key)
      const lruIndex = this.lruQueue.indexOf(key)
      if (lruIndex > -1) {
        this.lruQueue.splice(lruIndex, 1)
      }
      this.performanceMonitor.recordMetric('cache.miss', 0, {
        key,
        reason: 'expired',
      })
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.updateLRU(key)

    this.performanceMonitor.recordMetric('cache.hit', 0, { key })
    return entry.data as T
  }

  /**
   * Store data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entrySize = this.calculateSize(data)
    const entryTTL = ttl || this.config.defaultTTL

    // Check if we need to evict entries
    if (this.currentSize + entrySize > this.config.maxSize) {
      this.evictLRU(this.currentSize + entrySize)
    }

    // Remove existing entry if it exists
    const existingEntry = this.cache.get(key)
    if (existingEntry) {
      this.currentSize -= existingEntry.size
      const lruIndex = this.lruQueue.indexOf(key)
      if (lruIndex > -1) {
        this.lruQueue.splice(lruIndex, 1)
      }
    }

    // Add new entry
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: entryTTL,
      size: entrySize,
      accessCount: 0,
      lastAccessed: Date.now(),
    }

    this.cache.set(key, entry)
    this.currentSize += entrySize
    this.updateLRU(key)

    this.performanceMonitor.recordMetric('cache.set', entrySize, { key })
  }

  /**
   * Remove specific entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    this.currentSize -= entry.size
    this.cache.delete(key)
    const lruIndex = this.lruQueue.indexOf(key)
    if (lruIndex > -1) {
      this.lruQueue.splice(lruIndex, 1)
    }

    this.performanceMonitor.recordMetric('cache.delete', 0, { key })
    return true
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const entryCount = this.cache.size
    this.cache.clear()
    this.lruQueue.length = 0
    this.currentSize = 0

    this.performanceMonitor.recordMetric('cache.clear', entryCount)
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    entryCount: number
    hitRate: number
    memoryUsage: number
  } {
    const totalAccesses = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    )
    const hits = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + Math.max(0, entry.accessCount - 1),
      0
    )

    return {
      size: this.currentSize,
      entryCount: this.cache.size,
      hitRate: totalAccesses > 0 ? hits / totalAccesses : 0,
      memoryUsage: this.currentSize,
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    this.evictExpired()
  }
}
