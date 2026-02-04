/**
 * Versioned localStorage keys and migration from legacy keys.
 * Avoids schema conflicts and supports one-time migration on first read.
 *
 * In-memory cache (js-cache-storage) for repeated reads in the same page load.
 * Invalidated on 'storage' events so other-tab updates are visible.
 */

export const LS = {
  THEME: 'theme:v1',
  RUM_PROJECT_ID: 'rum.projectId:v1',
  RUM_WRITE_KEY: 'rum.writeKey:v1',
  SHOW_PERF_MONITOR: 'showPerfMonitor:v1',
  AI_RESPONSE_CACHE: 'ai_response_cache:v1',
  CURRENT_MONTH_TOKENS: 'current_month_tokens:v1',
  COOKIE_CONSENT: 'cookieConsent:v1',
} as const

const cache = new Map<string, string>()

function initStorageListener() {
  if (typeof window === 'undefined') return
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key != null) cache.delete(event.key)
  })
}
if (typeof window !== 'undefined') initStorageListener()

/**
 * Get item from localStorage with in-memory cache (avoids repeated reads/parse).
 * Use for hot paths: theme, consent, proactive support.
 */
export function getCached(key: string): string | null {
  try {
    const cached = cache.get(key)
    if (cached !== undefined) return cached
    const value = localStorage.getItem(key)
    if (value != null) cache.set(key, value)
    return value
  } catch {
    return null
  }
}

/**
 * Set item in localStorage and update cache so same-tab reads see the new value.
 */
export function setCached(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
    cache.set(key, value)
  } catch {
    // Ignore storage errors
  }
}

/**
 * Remove item from localStorage and cache.
 */
export function removeCached(key: string): void {
  try {
    localStorage.removeItem(key)
    cache.delete(key)
  } catch {
    // Ignore storage errors
  }
}

/**
 * Reads from the versioned key; if missing, reads from legacy key, writes to v1
 * and removes the legacy key. Returns null when absent or on error.
 * Uses cache for repeated reads.
 */
export function getWithMigration(
  v1Key: string,
  legacyKey: string
): string | null {
  try {
    let v = getCached(v1Key)
    if (v != null) return v
    v = getCached(legacyKey)
    if (v != null) {
      setCached(v1Key, v)
      removeCached(legacyKey)
      return v
    }
    return null
  } catch {
    return null
  }
}
