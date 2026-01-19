const express = require('express')
const { logger } = require('../utils/logger')
const { asyncHandler } = require('../middleware/errorHandler')
const { apiKeyAuth, optionalApiKeyAuth } = require('../middleware/auth')

const router = express.Router()

// In-memory metrics storage (use Redis in production)
let metrics = {
  startTime: Date.now(),
  requests: {
    total: 0,
    byMethod: {},
    byStatus: {},
    byEndpoint: {},
  },
  errors: {
    total: 0,
    byType: {},
    recent: [],
  },
  performance: {
    averageResponseTime: 0,
    slowestEndpoints: [],
    memoryUsage: {},
  },
}

// Middleware to collect request metrics
const collectMetrics = (req, res, next) => {
  const start = Date.now()
  const originalSend = res.send

  res.send = function (body) {
    const duration = Date.now() - start

    // Update metrics
    metrics.requests.total++
    metrics.requests.byMethod[req.method] = (metrics.requests.byMethod[req.method] || 0) + 1
    metrics.requests.byStatus[res.statusCode] = (metrics.requests.byStatus[res.statusCode] || 0) + 1

    const endpoint = `${req.method} ${req.route?.path || req.path}`
    metrics.requests.byEndpoint[endpoint] = (metrics.requests.byEndpoint[endpoint] || 0) + 1

    // Update performance metrics
    const currentAvg = metrics.performance.averageResponseTime
    const totalRequests = metrics.requests.total
    metrics.performance.averageResponseTime = (currentAvg * (totalRequests - 1) + duration) / totalRequests

    // Track slowest endpoints
    // eslint-disable-next-line no-use-before-define
    updateSlowestEndpoints(endpoint, duration)

    originalSend.call(this, body)
  }

  next()
}

// Update slowest endpoints tracking
const updateSlowestEndpoints = (endpoint, duration) => {
  const slowest = metrics.performance.slowestEndpoints
  slowest.push({ endpoint, duration, timestamp: Date.now() })
  slowest.sort((a, b) => b.duration - a.duration)
  metrics.performance.slowestEndpoints = slowest.slice(0, 10) // Keep top 10
}

// Collect error metrics
const collectErrorMetrics = (error, req) => {
  metrics.errors.total++
  const errorType = error.name || 'UnknownError'
  metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1

  // Keep recent errors (last 50)
  metrics.errors.recent.unshift({
    type: errorType,
    message: error.message,
    endpoint: `${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
    ip: req.ip,
  })
  metrics.errors.recent = metrics.errors.recent.slice(0, 50)
}

// Update memory usage
const updateMemoryUsage = () => {
  const memUsage = process.memoryUsage()
  metrics.performance.memoryUsage = {
    rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    external: Math.round(memUsage.external / 1024 / 1024), // MB
    timestamp: new Date().toISOString(),
  }
}

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get application metrics
 *     description: Retrieve comprehensive application metrics for monitoring
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: number
 *                   description: Application uptime in seconds
 *                 requests:
 *                   type: object
 *                   description: Request statistics
 *                 errors:
 *                   type: object
 *                   description: Error statistics
 *                 performance:
 *                   type: object
 *                   description: Performance metrics
 */
router.get(
  '/metrics',
  optionalApiKeyAuth,
  asyncHandler(async (req, res) => {
    updateMemoryUsage()

    const uptime = Math.floor((Date.now() - metrics.startTime) / 1000)

    res.json({
      uptime,
      timestamp: new Date().toISOString(),
      requests: metrics.requests,
      errors: metrics.errors,
      performance: metrics.performance,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        pid: process.pid,
      },
    })
  }),
)

/**
 * @swagger
 * /metrics/prometheus:
 *   get:
 *     summary: Get Prometheus-compatible metrics
 *     description: Retrieve metrics in Prometheus format
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Prometheus metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get(
  '/metrics/prometheus',
  optionalApiKeyAuth,
  asyncHandler(async (req, res) => {
    updateMemoryUsage()

    const uptime = Math.floor((Date.now() - metrics.startTime) / 1000)
    const memUsage = metrics.performance.memoryUsage

    let prometheusMetrics = `# HELP tcdynamics_uptime_seconds Application uptime in seconds
# TYPE tcdynamics_uptime_seconds gauge
tcdynamics_uptime_seconds ${uptime}

# HELP tcdynamics_requests_total Total number of requests
# TYPE tcdynamics_requests_total counter
tcdynamics_requests_total ${metrics.requests.total}

# HELP tcdynamics_errors_total Total number of errors
# TYPE tcdynamics_errors_total counter
tcdynamics_errors_total ${metrics.errors.total}

# HELP tcdynamics_response_time_average Average response time in milliseconds
# TYPE tcdynamics_response_time_average gauge
tcdynamics_response_time_average ${metrics.performance.averageResponseTime}

# HELP tcdynamics_memory_usage_rss Memory usage RSS in MB
# TYPE tcdynamics_memory_usage_rss gauge
tcdynamics_memory_usage_rss ${memUsage.rss || 0}

# HELP tcdynamics_memory_usage_heap_used Heap memory used in MB
# TYPE tcdynamics_memory_usage_heap_used gauge
tcdynamics_memory_usage_heap_used ${memUsage.heapUsed || 0}

# HELP tcdynamics_memory_usage_heap_total Heap memory total in MB
# TYPE tcdynamics_memory_usage_heap_total gauge
tcdynamics_memory_usage_heap_total ${memUsage.heapTotal || 0}

`

    // Add method-specific metrics
    Object.entries(metrics.requests.byMethod).forEach(([method, count]) => {
      prometheusMetrics += `# HELP tcdynamics_requests_by_method_total Requests by HTTP method
# TYPE tcdynamics_requests_by_method_total counter
tcdynamics_requests_by_method_total{method="${method}"} ${count}
`
    })

    // Add status-specific metrics
    Object.entries(metrics.requests.byStatus).forEach(([status, count]) => {
      prometheusMetrics += `# HELP tcdynamics_requests_by_status_total Requests by HTTP status
# TYPE tcdynamics_requests_by_status_total counter
tcdynamics_requests_by_status_total{status="${status}"} ${count}
`
    })

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send(prometheusMetrics)
  }),
)

/**
 * @swagger
 * /metrics/health/detailed:
 *   get:
 *     summary: Get detailed health status
 *     description: Comprehensive health check with detailed information
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Detailed health status
 */
router.get(
  '/health/detailed',
  optionalApiKeyAuth,
  asyncHandler(async (req, res) => {
    updateMemoryUsage()

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unknown', // Would need actual DB check
        redis: 'unknown', // Would need actual Redis check
        email: process.env.EMAIL_USER ? 'configured' : 'not_configured',
      },
      metrics: {
        totalRequests: metrics.requests.total,
        totalErrors: metrics.errors.total,
        averageResponseTime: Math.round(
          metrics.performance.averageResponseTime,
        ),
        memoryUsage: metrics.performance.memoryUsage,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        cpuCount: require('os').cpus().length,
        totalMemory: Math.round(require('os').totalmem() / 1024 / 1024 / 1024), // GB
        freeMemory: Math.round(require('os').freemem() / 1024 / 1024 / 1024), // GB
      },
    }

    // Check if there are recent errors
    const recentErrors = metrics.errors.recent.filter(error => {
      const errorTime = new Date(error.timestamp).getTime()
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      return errorTime > fiveMinutesAgo
    })

    if (recentErrors.length > 0) {
      health.status = 'degraded'
      health.recentErrors = recentErrors.length
    }

    // Check memory usage
    const memUsagePercent = (metrics.performance.memoryUsage.heapUsed
        / metrics.performance.memoryUsage.heapTotal)
      * 100
    if (memUsagePercent > 90) {
      health.status = 'warning'
      health.memoryWarning = `High memory usage: ${memUsagePercent.toFixed(1)}%`
    }

    res.json(health)
  }),
)

/**
 * @swagger
 * /metrics/reset:
 *   post:
 *     summary: Reset metrics
 *     description: Reset all application metrics (admin only)
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Metrics reset successfully
 */
router.post(
  '/metrics/reset',
  apiKeyAuth,
  asyncHandler(async (req, res) => {
    // Reset metrics
    metrics = {
      startTime: Date.now(),
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
        byEndpoint: {},
      },
      errors: {
        total: 0,
        byType: {},
        recent: [],
      },
      performance: {
        averageResponseTime: 0,
        slowestEndpoints: [],
        memoryUsage: {},
      },
    }

    logger.info('Metrics reset requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.headers['x-request-id'],
    })

    res.json({
      success: true,
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString(),
    })
  }),
)

module.exports = {
  router,
  collectMetrics,
  collectErrorMetrics,
}
