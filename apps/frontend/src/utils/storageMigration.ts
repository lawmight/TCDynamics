/**
 * Versioned localStorage keys and migration from legacy keys.
 * Avoids schema conflicts and supports one-time migration on first read.
 */

export const LS = {
  THEME: 'theme:v1',
  RUM_PROJECT_ID: 'rum.projectId:v1',
  RUM_WRITE_KEY: 'rum.writeKey:v1',
  SHOW_PERF_MONITOR: 'showPerfMonitor:v1',
  AI_RESPONSE_CACHE: 'ai_response_cache:v1',
  CURRENT_MONTH_TOKENS: 'current_month_tokens:v1',
} as const

/**
 * Reads from the versioned key; if missing, reads from legacy key, writes to v1
 * and removes the legacy key. Returns null when absent or on error.
 */
export function getWithMigration(
  v1Key: string,
  legacyKey: string
): string | null {
  try {
    let v = localStorage.getItem(v1Key)
    if (v != null) return v
    v = localStorage.getItem(legacyKey)
    if (v != null) {
      localStorage.setItem(v1Key, v)
      localStorage.removeItem(legacyKey)
      return v
    }
    return null
  } catch {
    return null
  }
}
