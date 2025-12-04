/**
 * LRU Cache Utility
 *
 * In-memory LRU cache for API responses.
 * Max 500 entries, 5 minute default TTL.
 * Cache is shared across all function invocations in the same instance.
 */

import { LRUCache } from 'lru-cache'

/**
 * In-memory LRU cache instance
 * Max 500 entries, 5 minute TTL
 */
const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
  updateAgeOnGet: true, // Reset TTL on access
})

/**
 * Get cached value by key
 * @param {string} key - Cache key
 * @returns {any|null} Cached value or null if not found
 */
export function getCached(key) {
  return cache.get(key) || null
}

/**
 * Set cached value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} [ttl] - Optional custom TTL in milliseconds
 */
export function setCached(key, value, ttl = null) {
  if (ttl) {
    cache.set(key, value, { ttl })
  } else {
    cache.set(key, value)
  }
}

/**
 * Clear cache entry
 * @param {string} key - Cache key
 */
export function clearCached(key) {
  cache.delete(key)
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  cache.clear()
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats with size and calculatedSize
 */
export function getCacheStats() {
  return {
    size: cache.size,
    calculatedSize: cache.calculatedSize,
  }
}

export default {
  getCached,
  setCached,
  clearCached,
  clearAllCache,
  getCacheStats,
}

