import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
  bundleSize?: number
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (
      process.env.NODE_ENV !== 'development' &&
      !localStorage.getItem('showPerfMonitor')
    ) {
      return
    }

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      const loadTime = navigation.loadEventEnd - navigation.fetchStart
      const renderTime =
        paint.find(entry => entry.name === 'first-contentful-paint')
          ?.startTime || 0

      // Get memory usage if available (Chrome only)
      const memoryInfo = (performance as any).memory
      const memoryUsage = memoryInfo
        ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)
        : undefined

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage,
      })
    }

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    return () => {
      window.removeEventListener('load', measurePerformance)
    }
  }, [])

  // Toggle visibility with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev)
        localStorage.setItem('showPerfMonitor', (!isVisible).toString())
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isVisible])

  if (!metrics || !isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">Performance Monitor</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>Load: {metrics.loadTime}ms</div>
        <div>Render: {metrics.renderTime}ms</div>
        {metrics.memoryUsage && <div>Memory: {metrics.memoryUsage}MB</div>}
      </div>
      <div className="text-gray-400 mt-2 text-xs">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  )
}

export default PerformanceMonitor
