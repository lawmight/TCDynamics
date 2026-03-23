import { useEffect, useState } from 'react'

import { getWithMigration, LS } from '@/utils/storageMigration'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
  bundleSize?: number
}

const PerformanceMonitor = () => {
  const isBrowser = typeof window !== 'undefined'
  const getStoredPreference = () =>
    isBrowser ? getWithMigration(LS.SHOW_PERF_MONITOR, 'showPerfMonitor') : null

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
      !getWithMigration(LS.SHOW_PERF_MONITOR, 'showPerfMonitor')
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
          localStorage.setItem(LS.SHOW_PERF_MONITOR, nextValue.toString())
          return nextValue
        })
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isBrowser, isVisible])

  if (!metrics || !isVisible) return null

  return (
    <div className="bg-foreground/80 text-background fixed bottom-4 right-4 z-50 rounded-lg p-3 font-mono text-xs backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold">Moniteur de performance</span>
        <button
          aria-label="Fermer le moniteur de performance"
          onClick={() => {
            setIsVisible(false)
            if (isBrowser) {
              localStorage.setItem(LS.SHOW_PERF_MONITOR, 'false')
            }
          }}
          className="text-background/70 focus-visible:ring-ring hover:text-background focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
        >
          <span aria-hidden="true">×</span>
          <span className="sr-only">Fermer</span>
        </button>
      </div>
      <div className="space-y-1">
        <div>Chargement: {metrics.loadTime}ms</div>
        <div>Rendu: {metrics.renderTime}ms</div>
        {typeof metrics.memoryUsage === 'number' ? (
          <div>Mémoire: {metrics.memoryUsage}MB</div>
        ) : null}
      </div>
      <div className="text-background/70 mt-2 text-xs">
        Ctrl+Shift+P pour afficher ou masquer
      </div>
    </div>
  )
}

export default PerformanceMonitor
