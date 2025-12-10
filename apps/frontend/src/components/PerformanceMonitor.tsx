import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
  bundleSize?: number
}

const PerformanceMonitor = () => {
  const isBrowser = typeof window !== 'undefined'
  const getStoredPreference = () =>
    isBrowser ? localStorage.getItem('showPerfMonitor') : null

  type MetaEnv = { MODE?: string; VITEST?: string }
  const metaEnv: MetaEnv | undefined =
    typeof import.meta !== 'undefined'
      ? (import.meta as unknown as { env?: MetaEnv }).env
      : undefined

  const envMode =
    metaEnv?.MODE ||
    (typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined) ||
    'production'
  const isVitest =
    metaEnv?.VITEST === 'true' ||
    (typeof process !== 'undefined' && process.env?.VITEST === 'true')

  const initialVisibility = (() => {
    const stored = getStoredPreference()
    if (stored === 'true') return true
    if (stored === 'false') return false
    return envMode === 'development' || isVitest || envMode === 'test'
  })()

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/58095262-9eae-40ce-bf51-b3d6c86e36b2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'perf-fix',
      hypothesisId: 'H4',
      location: 'PerformanceMonitor.tsx:init',
      message: 'env snapshot',
      data: {
        processExists: typeof process !== 'undefined',
        envMode,
        isVitest,
        storedPreference: getStoredPreference(),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(initialVisibility)

  useEffect(() => {
    if (
      !isBrowser ||
      typeof performance === 'undefined' ||
      typeof performance.getEntriesByType !== 'function'
    ) {
      return
    }

    // Only show in development or when explicitly enabled
    const isTestEnv = envMode === 'test' || isVitest

    if (
      !isTestEnv &&
      envMode !== 'development' &&
      !localStorage.getItem('showPerfMonitor')
    ) {
      return
    }

    const measurePerformance = () => {
      const navigationEntries = performance.getEntriesByType(
        'navigation'
      ) as PerformanceNavigationTiming[]
      if (!navigationEntries?.length) return

      const navigation = navigationEntries[0]
      const paint = performance.getEntriesByType('paint')

      const loadTime = navigation?.loadEventEnd - navigation?.fetchStart
      const renderTime =
        paint.find(entry => entry.name === 'first-contentful-paint')
          ?.startTime || 0

      // Get memory usage if available (Chrome only)
      const memoryInfo = (
        performance as { memory?: { usedJSHeapSize: number } }
      ).memory
      const memoryUsage = memoryInfo
        ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)
        : undefined

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage,
      })
    }

    // Always register load listener in browser/test environments
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('load', measurePerformance)
    }

    // Measure immediately if already loaded
    if (document?.readyState === 'complete') {
      measurePerformance()
    }

    return () => {
      if (typeof window.removeEventListener === 'function') {
        window.removeEventListener('load', measurePerformance)
      }
    }
  }, [envMode, isBrowser, isVitest])

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    if (!isBrowser || typeof window.addEventListener !== 'function') return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => {
          const nextValue = !prev
          localStorage.setItem('showPerfMonitor', nextValue.toString())
          return nextValue
        })
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isBrowser, isVisible])

  if (!metrics || !isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black/80 p-3 font-mono text-xs text-white">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold">Performance Monitor</span>
        <button
          aria-label="Close performance monitor"
          onClick={() => {
            setIsVisible(false)
            if (isBrowser) {
              localStorage.setItem('showPerfMonitor', 'false')
            }
          }}
          className="text-gray-400 hover:text-white"
        >
          <span aria-hidden="true">×</span>
          <span className="sr-only">Close</span>
        </button>
      </div>
      <div className="space-y-1">
        <div>Load: {metrics.loadTime}ms</div>
        <div>Render: {metrics.renderTime}ms</div>
        {metrics.memoryUsage && <div>Memory: {metrics.memoryUsage}MB</div>}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  )
}

export default PerformanceMonitor
