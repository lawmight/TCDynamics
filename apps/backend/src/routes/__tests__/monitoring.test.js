const request = require('supertest')
const express = require('express')
const {
  router: monitoringRouter,
  collectMetrics,
  collectErrorMetrics,
} = require('../monitoring')

// Mock dependencies
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('../../middleware/errorHandler', () => ({
  asyncHandler: fn => fn,
}))

jest.mock('../../middleware/auth', () => ({
  apiKeyAuth: jest.fn((req, res, next) => {
    req.user = { id: 'test-admin' }
    next()
  }),
  optionalApiKeyAuth: jest.fn((req, res, next) => next()),
}))

const { logger } = require('../../utils/logger')

describe('Monitoring Routes', () => {
  let app
  let originalMetrics

  beforeEach(() => {
    jest.clearAllMocks()

    // Store original metrics to restore later
    originalMetrics = require('../monitoring').metrics

    // Reset metrics to clean state
    const monitoringModule = require('../monitoring')
    monitoringModule.metrics = {
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
        memoryUsage: {
          rss: 100,
          heapTotal: 200,
          heapUsed: 150,
          external: 50,
          timestamp: new Date().toISOString(),
        },
      },
    }

    // Create express app for testing
    app = express()
    app.use(express.json())
    app.use('/monitoring', monitoringRouter)

    // Mock environment variables
    process.env.npm_package_version = '1.0.0-test'
  })

  afterEach(() => {
    // Restore original metrics
    const monitoringModule = require('../monitoring')
    monitoringModule.metrics = originalMetrics
  })

  describe('GET /metrics', () => {
    it('should return application metrics without authentication', async () => {
      const response = await request(app).get('/monitoring/metrics').expect(200)

      expect(response.body).toHaveProperty('uptime')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('requests')
      expect(response.body).toHaveProperty('errors')
      expect(response.body).toHaveProperty('performance')
      expect(response.body).toHaveProperty('system')

      expect(response.body.requests).toHaveProperty('total', 0)
      expect(response.body.errors).toHaveProperty('total', 0)
      expect(response.body.system).toHaveProperty('nodeVersion')
      expect(response.body.system).toHaveProperty('platform')
    })

    it('should return updated memory usage', async () => {
      const response = await request(app).get('/monitoring/metrics').expect(200)

      expect(response.body.performance).toHaveProperty('memoryUsage')
      expect(response.body.performance.memoryUsage).toHaveProperty('rss')
      expect(response.body.performance.memoryUsage).toHaveProperty('heapTotal')
      expect(response.body.performance.memoryUsage).toHaveProperty('heapUsed')
      expect(response.body.performance.memoryUsage).toHaveProperty('external')
    })

    it('should calculate uptime correctly', async () => {
      const response = await request(app).get('/monitoring/metrics').expect(200)

      expect(typeof response.body.uptime).toBe('number')
      expect(response.body.uptime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('GET /metrics/prometheus', () => {
    it('should return metrics in Prometheus format', async () => {
      const response = await request(app)
        .get('/monitoring/metrics/prometheus')
        .expect(200)

      expect(response.headers['content-type']).toMatch(/text\/plain/)
      expect(response.text).toContain('# HELP tcdynamics_uptime_seconds')
      expect(response.text).toContain('# TYPE tcdynamics_uptime_seconds gauge')
      expect(response.text).toContain('# HELP tcdynamics_requests_total')
      expect(response.text).toContain(
        '# TYPE tcdynamics_requests_total counter',
      )
      expect(response.text).toContain('# HELP tcdynamics_memory_usage_rss')
      expect(response.text).toContain(
        '# TYPE tcdynamics_memory_usage_rss gauge',
      )
    })

    it('should include method-specific metrics when requests exist', async () => {
      // Add some request data
      const monitoringModule = require('../monitoring')
      monitoringModule.metrics.requests.byMethod = {
        GET: 5,
        POST: 3,
      }

      const response = await request(app)
        .get('/monitoring/metrics/prometheus')
        .expect(200)

      expect(response.text).toContain(
        'tcdynamics_requests_by_method_total{method="GET"} 5',
      )
      expect(response.text).toContain(
        'tcdynamics_requests_by_method_total{method="POST"} 3',
      )
    })

    it('should include status-specific metrics when requests exist', async () => {
      // Add some status data
      const monitoringModule = require('../monitoring')
      monitoringModule.metrics.requests.byStatus = {
        200: 10,
        404: 2,
        500: 1,
      }

      const response = await request(app)
        .get('/monitoring/metrics/prometheus')
        .expect(200)

      expect(response.text).toContain(
        'tcdynamics_requests_by_status_total{status="200"} 10',
      )
      expect(response.text).toContain(
        'tcdynamics_requests_by_status_total{status="404"} 2',
      )
      expect(response.text).toContain(
        'tcdynamics_requests_by_status_total{status="500"} 1',
      )
    })
  })

  describe('GET /health/detailed', () => {
    it('should return healthy status for normal operation', async () => {
      const response = await request(app)
        .get('/monitoring/health/detailed')
        .expect(200)

      expect(response.body.status).toBe('healthy')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
      expect(response.body).toHaveProperty('version', '1.0.0-test')
      expect(response.body).toHaveProperty('environment')
      expect(response.body).toHaveProperty('services')
      expect(response.body).toHaveProperty('metrics')
      expect(response.body).toHaveProperty('system')
    })

    it('should detect degraded status with recent errors', async () => {
      // Add recent error
      const monitoringModule = require('../monitoring')
      const fiveMinutesAgo = Date.now() - 3 * 60 * 1000 // 3 minutes ago
      monitoringModule.metrics.errors.recent = [
        {
          type: 'TestError',
          message: 'Test error',
          endpoint: 'GET /test',
          timestamp: new Date(fiveMinutesAgo).toISOString(),
          ip: '127.0.0.1',
        },
      ]

      const response = await request(app)
        .get('/monitoring/health/detailed')
        .expect(200)

      expect(response.body.status).toBe('degraded')
      expect(response.body).toHaveProperty('recentErrors', 1)
    })

    it('should detect warning status with high memory usage', async () => {
      // Set high memory usage
      const monitoringModule = require('../monitoring')
      monitoringModule.metrics.performance.memoryUsage = {
        heapUsed: 180,
        heapTotal: 200,
        rss: 100,
        external: 50,
        timestamp: new Date().toISOString(),
      }

      const response = await request(app)
        .get('/monitoring/health/detailed')
        .expect(200)

      expect(response.body.status).toBe('warning')
      expect(response.body).toHaveProperty('memoryWarning')
    })

    it('should ignore old errors in health check', async () => {
      // Add old error (more than 5 minutes ago)
      const monitoringModule = require('../monitoring')
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000 // 10 minutes ago
      monitoringModule.metrics.errors.recent = [
        {
          type: 'OldError',
          message: 'Old error',
          endpoint: 'GET /test',
          timestamp: new Date(tenMinutesAgo).toISOString(),
          ip: '127.0.0.1',
        },
      ]

      const response = await request(app)
        .get('/monitoring/health/detailed')
        .expect(200)

      expect(response.body.status).toBe('healthy')
      expect(response.body).not.toHaveProperty('recentErrors')
    })
  })

  describe('POST /metrics/reset', () => {
    it('should reset metrics with admin authentication', async () => {
      const response = await request(app)
        .post('/monitoring/metrics/reset')
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        message: 'Metrics reset successfully',
        timestamp: expect.any(String),
      })

      expect(logger.info).toHaveBeenCalledWith('Metrics reset requested', {
        ip: expect.any(String),
        userAgent: expect.any(String),
        requestId: expect.any(String),
      })
    })

    it('should apply admin authentication middleware', async () => {
      await request(app).post('/monitoring/metrics/reset')

      // Should have called the auth middleware
      const { apiKeyAuth } = require('../../middleware/auth')
      expect(apiKeyAuth).toHaveBeenCalled()
    })
  })

  describe('collectMetrics middleware', () => {
    it('should collect request metrics', async () => {
      const monitoringModule = require('../monitoring')

      // Create a simple app with the middleware
      const testApp = express()
      testApp.use(collectMetrics)
      testApp.get('/test', (req, res) => res.send('OK'))

      await request(testApp).get('/test').expect(200)

      expect(monitoringModule.metrics.requests.total).toBe(1)
      expect(monitoringModule.metrics.requests.byMethod.GET).toBe(1)
      expect(monitoringModule.metrics.requests.byStatus[200]).toBe(1)
      expect(monitoringModule.metrics.requests.byEndpoint['GET /test']).toBe(1)
    })

    it('should calculate average response time', async () => {
      const monitoringModule = require('../monitoring')

      // Create a simple app with the middleware
      const testApp = express()
      testApp.use(collectMetrics)
      testApp.get('/test', (req, res) => res.send('OK'))

      await request(testApp).get('/test').expect(200)

      expect(
        monitoringModule.metrics.performance.averageResponseTime,
      ).toBeGreaterThan(0)
    })

    it('should track slowest endpoints', async () => {
      const monitoringModule = require('../monitoring')

      // Create a simple app with the middleware
      const testApp = express()
      testApp.use(collectMetrics)
      testApp.get('/test', (req, res) => res.send('OK'))

      await request(testApp).get('/test').expect(200)

      expect(
        monitoringModule.metrics.performance.slowestEndpoints,
      ).toHaveLength(1)
      expect(
        monitoringModule.metrics.performance.slowestEndpoints[0],
      ).toHaveProperty('endpoint', 'GET /test')
      expect(
        monitoringModule.metrics.performance.slowestEndpoints[0],
      ).toHaveProperty('duration')
      expect(
        monitoringModule.metrics.performance.slowestEndpoints[0],
      ).toHaveProperty('timestamp')
    })

    it('should handle multiple requests correctly', async () => {
      const monitoringModule = require('../monitoring')

      // Create a simple app with the middleware
      const testApp = express()
      testApp.use(collectMetrics)
      testApp.get('/test', (req, res) => res.send('OK'))

      // Make multiple requests
      await Promise.all([
        request(testApp).get('/test').expect(200),
        request(testApp).get('/test').expect(200),
        request(testApp).get('/test').expect(200),
      ])

      expect(monitoringModule.metrics.requests.total).toBe(3)
      expect(monitoringModule.metrics.requests.byMethod.GET).toBe(3)
    })
  })

  describe('collectErrorMetrics function', () => {
    it('should collect error metrics', () => {
      const monitoringModule = require('../monitoring')
      const mockError = new Error('Test error')
      const mockReq = {
        method: 'POST',
        path: '/test',
        ip: '127.0.0.1',
      }

      collectErrorMetrics(mockError, mockReq)

      expect(monitoringModule.metrics.errors.total).toBe(1)
      expect(monitoringModule.metrics.errors.byType.Error).toBe(1)
      expect(monitoringModule.metrics.errors.recent).toHaveLength(1)
      expect(monitoringModule.metrics.errors.recent[0]).toEqual({
        type: 'Error',
        message: 'Test error',
        endpoint: 'POST /test',
        timestamp: expect.any(String),
        ip: '127.0.0.1',
      })
    })

    it('should handle errors without name property', () => {
      const monitoringModule = require('../monitoring')
      const mockError = { message: 'Test error without name' }
      const mockReq = {
        method: 'GET',
        path: '/test',
        ip: '127.0.0.1',
      }

      collectErrorMetrics(mockError, mockReq)

      expect(monitoringModule.metrics.errors.byType.UnknownError).toBe(1)
    })

    it('should limit recent errors to 50', () => {
      const monitoringModule = require('../monitoring')

      // Add 55 errors
      for (let i = 0; i < 55; i++) {
        const mockError = new Error(`Test error ${i}`)
        const mockReq = {
          method: 'GET',
          path: '/test',
          ip: '127.0.0.1',
        }
        collectErrorMetrics(mockError, mockReq)
      }

      expect(monitoringModule.metrics.errors.recent).toHaveLength(50)
      expect(monitoringModule.metrics.errors.recent[0].message).toBe(
        'Test error 54',
      )
    })
  })

  describe('Integration with error handling', () => {
    it('should work with error middleware', async () => {
      // Create app with error-throwing route
      const testApp = express()
      testApp.use(collectMetrics)
      testApp.use('/monitoring', monitoringRouter)

      // Add a route that throws an error
      testApp.get('/error', (_req, _res) => {
        throw new Error('Test error')
      })

      // Mock error handler middleware
      testApp.use((error, req, res, _next) => {
        collectErrorMetrics(error, req)
        res.status(500).json({ error: 'Internal server error' })
      })

      const response = await request(testApp).get('/error').expect(500)

      expect(response.body.error).toBe('Internal server error')

      // Check that error was collected
      const monitoringModule = require('../monitoring')
      expect(monitoringModule.metrics.errors.total).toBe(1)
    })
  })
})
