// AI Response Caching System
// Reduces Azure OpenAI API calls by caching responses

import crypto from 'crypto'

interface CacheEntry {
  response: string
  timestamp: number
  tokens: number
  hitCount: number
}

class AIResponseCache {
  private cache: Map<string, CacheEntry>
  private maxCacheSize: number = 1000 // Maximum number of cached responses
  private cacheTTL: number = 86400000 // 24 hours in milliseconds

  constructor() {
    this.cache = new Map()
    this.initializeFromLocalStorage()
  }

  // Generate a unique hash for the prompt
  private hashPrompt(prompt: string, systemPrompt?: string): string {
    const combined = `${systemPrompt || ''}::${prompt}`
    return crypto.createHash('md5').update(combined).digest('hex')
  }

  // Check if a cached response exists and is valid
  getCached(prompt: string, systemPrompt?: string): string | null {
    const hash = this.hashPrompt(prompt, systemPrompt)
    const entry = this.cache.get(hash)

    if (!entry) {
      return null
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(hash)
      return null
    }

    // Update hit count
    entry.hitCount++
    this.cache.set(hash, entry)

    // Cache hit - tokens saved

    return entry.response
  }

  // Store a new response in cache
  setCached(
    prompt: string,
    response: string,
    tokens: number,
    systemPrompt?: string
  ): void {
    const hash = this.hashPrompt(prompt, systemPrompt)

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.findOldestEntry()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      tokens,
      hitCount: 0,
    }

    this.cache.set(hash, entry)
    this.saveToLocalStorage()
  }

  // Find the oldest cache entry for LRU eviction
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  // Get cache statistics
  getStats(): {
    size: number
    tokensSaved: number
    hitRate: number
    estimatedCostSaved: number
  } {
    let totalTokensSaved = 0
    let totalHits = 0

    for (const entry of this.cache.values()) {
      totalTokensSaved += entry.tokens * entry.hitCount
      totalHits += entry.hitCount
    }

    // Azure OpenAI pricing: $0.002 per 1K tokens (GPT-3.5-turbo)
    const estimatedCostSaved = (totalTokensSaved / 1000) * 0.002

    return {
      size: this.cache.size,
      tokensSaved: totalTokensSaved,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      estimatedCostSaved,
    }
  }

  // Clear expired entries
  cleanupExpired(): number {
    let removed = 0
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        this.cache.delete(key)
        removed++
      }
    }

    if (removed > 0) {
      this.saveToLocalStorage()
    }

    return removed
  }

  // Persist cache to localStorage (for browser) or file system (for Node.js)
  private saveToLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Browser environment
      const cacheData = Array.from(this.cache.entries())
      localStorage.setItem('ai_response_cache', JSON.stringify(cacheData))
    }
    // Node.js file system caching handled separately if needed
  }

  // Load cache from localStorage or file system
  private initializeFromLocalStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Browser environment
        const stored = localStorage.getItem('ai_response_cache')
        if (stored) {
          const cacheData = JSON.parse(stored)
          this.cache = new Map(cacheData)
          this.cleanupExpired()
        }
      }
    } catch {
      // Failed to load cache, start fresh
      this.cache = new Map()
    }
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear()
    this.saveToLocalStorage()
  }
}

// Singleton instance
const aiCache = new AIResponseCache()

// Wrapper function for OpenAI API calls with caching
export async function callOpenAIWithCache(
  prompt: string,
  systemPrompt?: string,
  options?: {
    maxTokens?: number
    temperature?: number
    useCache?: boolean
  }
): Promise<{ response: string; cached: boolean; tokens: number }> {
  const { maxTokens = 500, temperature = 0.7, useCache = true } = options || {}

  // Check cache first if enabled
  if (useCache) {
    const cached = aiCache.getCached(prompt, systemPrompt)
    if (cached) {
      return {
        response: cached,
        cached: true,
        tokens: 0, // No new tokens used
      }
    }
  }

  // Make actual API call if not cached
  try {
    // Import your existing API service
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    })

    const data = await response.json()

    if (data.choices && data.choices[0]) {
      const responseText = data.choices[0].message.content
      const tokensUsed = data.usage?.total_tokens || 0

      // Cache the response if caching is enabled
      if (useCache && responseText) {
        aiCache.setCached(prompt, responseText, tokensUsed, systemPrompt)
      }

      return {
        response: responseText,
        cached: false,
        tokens: tokensUsed,
      }
    }

    throw new Error('Invalid response from OpenAI API')
  } catch (error) {
    // Re-throw the error with context if needed
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// Export cache instance for direct access if needed
export { aiCache }

// Monitoring function to track free tier usage
export function getFreeTierStatus(): {
  tokensUsed: number
  tokensRemaining: number
  percentageUsed: number
  daysUntilReset: number
  projectedMonthlyUsage: number
  withinFreeLimit: boolean
} {
  const FREE_TIER_LIMIT = 1000000 // 1M tokens per month

  // Get current month's token usage (you'll need to track this separately)
  const currentMonthTokens = parseInt(
    localStorage.getItem('current_month_tokens') || '0'
  )

  const now = new Date()
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()
  const dayOfMonth = now.getDate()
  const daysRemaining = daysInMonth - dayOfMonth

  // Project usage for the entire month based on current rate
  const dailyRate = currentMonthTokens / dayOfMonth
  const projectedMonthlyUsage = dailyRate * daysInMonth

  return {
    tokensUsed: currentMonthTokens,
    tokensRemaining: Math.max(0, FREE_TIER_LIMIT - currentMonthTokens),
    percentageUsed: (currentMonthTokens / FREE_TIER_LIMIT) * 100,
    daysUntilReset: daysRemaining,
    projectedMonthlyUsage,
    withinFreeLimit: projectedMonthlyUsage <= FREE_TIER_LIMIT,
  }
}

export default aiCache
