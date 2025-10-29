;(function () {
  var w = window
  var d = document
  var s =
    d.currentScript ||
    (function () {
      var scripts = d.getElementsByTagName('script')
      return scripts[scripts.length - 1]
    })()

  var dataset = s && s.dataset ? s.dataset : {}
  var WRITE_KEY = dataset.key || s.getAttribute('data-key')
  var PROJECT_ID = dataset.project || s.getAttribute('data-project')
  var ENDPOINT = dataset.endpoint || w.RUM_ENDPOINT || '/api/rum/collect'
  var SAMPLE = Number(dataset.sample || dataset.sampleRate || 0.05)

  if (Math.random() > SAMPLE) return // client sampling

  var queue = []
  var maxBatch = 20
  var flushIntervalMs = 5000
  var flushed = false

  function nowIso() {
    return new Date().toISOString()
  }

  function pathFromLocation() {
    try {
      return w.location.pathname || '/'
    } catch (e) {
      return '/'
    }
  }

  function deviceType() {
    var width = w.innerWidth || 1024
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  function enqueue(metric, value, meta) {
    var evt = {
      ts: nowIso(),
      path: pathFromLocation(),
      device: deviceType(),
      metric: metric,
      value: value,
      metadata: meta || {},
    }
    queue.push(evt)
    if (queue.length >= maxBatch) flush()
  }

  function flush() {
    if (!queue.length) return
    var payload = {
      projectId: PROJECT_ID,
      key: WRITE_KEY,
      events: queue.splice(0, queue.length),
    }

    var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        ENDPOINT + '?k=' + encodeURIComponent(WRITE_KEY),
        blob
      )
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Write-Key': WRITE_KEY,
        },
        body: JSON.stringify(payload),
        keepalive: true,
        credentials: 'omit',
      }).catch(function () {})
    }
  }

  function onVisibilityChange() {
    if (d.visibilityState === 'hidden' || d.readyState === 'unloading') {
      flush()
      flushed = true
    }
  }

  setInterval(function () {
    if (!flushed) flush()
  }, flushIntervalMs)
  d.addEventListener('visibilitychange', onVisibilityChange, { capture: true })
  w.addEventListener('pagehide', flush, { capture: true })

  // Basic TTFB via PerformanceNavigationTiming
  try {
    var nav =
      performance.getEntriesByType &&
      performance.getEntriesByType('navigation')[0]
    if (
      nav &&
      typeof nav.responseStart === 'number' &&
      typeof nav.requestStart === 'number'
    ) {
      enqueue('TTFB', Math.max(0, nav.responseStart - nav.requestStart))
    }
  } catch (e) {}

  // Long tasks (LT)
  try {
    if ('PerformanceObserver' in w) {
      var ltObs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          enqueue('LT', entry.duration, { name: entry.name })
        })
      })
      ltObs.observe({ type: 'longtask', buffered: true })
    }
  } catch (e) {}

  // Core Web Vitals via web-vitals library (async loaded)
  function loadScript(src, onload) {
    var el = d.createElement('script')
    el.src = src
    el.async = true
    el.defer = true
    el.crossOrigin = 'anonymous'
    el.onload = onload
    d.head.appendChild(el)
  }

  function initVitals(api) {
    try {
      api.onCLS(function (metric) {
        enqueue('CLS', metric.value)
      })
      api.onLCP(function (metric) {
        enqueue('LCP', metric.value)
      })
      api.onINP(function (metric) {
        enqueue('INP', metric.value)
      })
      api.onFCP(function (metric) {
        enqueue('FCP', metric.value)
      })
    } catch (e) {}
  }

  var cdn =
    s.getAttribute('data-web-vitals') ||
    'https://unpkg.com/web-vitals@4/dist/web-vitals.iife.js'
  loadScript(cdn, function () {
    if (w.webVitals) initVitals(w.webVitals)
  })
})()
