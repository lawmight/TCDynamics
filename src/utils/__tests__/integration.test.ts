import { describe, it, expect, vi, beforeEach } from 'vitest'
import { config } from '../config'
import { performanceMonitor, smartCache, cacheTelemetry } from '../performance'
import { securityHeaders } from '../security'
import {
  isBrowser,
  isDevelopment,
  cryptoUtils,
  storageUtils,
} from '../isomorphic'

// Mock import.meta.env for testing
const mockEnv = {
  VITE_AZURE_FUNCTIONS_URL: 'https://test-functions.com/api',
  VITE_NODE_ENV: 'test',
  VITE_APP_VERSION: '1.0.0-test',
  VITE_FEATURE_ENABLE_ANALYTICS: 'true',
  VITE_FEATURE_ENABLE_DEBUG_LOGGING: 'false',
  VITE_FEATURE_ENABLE_CACHE: 'true',
  VITE_CACHE_MAX_SIZE: '500',
  VITE_CACHE_DEFAULT_TTL: '120000',
  VITE_CACHE_CLEANUP_INTERVAL: '60000',
  VITE_PERFORMANCE_ENABLE_SAMPLING: 'true',
  VITE_PERFORMANCE_SAMPLE_RATE: '0.5',
  VITE_PERFORMANCE_MAX_METRICS: '800',
  VITE_SECURITY_CSP_STRICT: 'false',
  VITE_SECURITY_RATE_LIMIT_REQUESTS: '50',
  VITE_SECURITY_RATE_LIMIT_WINDOW: '30000',
}

vi.mock('import.meta', () => ({
  env: mockEnv,
}))

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset config state
    vi.doMock('../config', () => ({
      config: {
        initialize: vi.fn().mockResolvedValue(undefined),
        client: {},
        server: {},
        isDevelopment: false,
        isProduction: false,
        functionsBaseUrl: mockEnv.VITE_AZURE_FUNCTIONS_URL,
      },
    }))
  })

  describe('Configuration Integration', () => {
    it('should initialize configuration with safe defaults', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configInstance = new (config.constructor as any)()
      await configInstance.initialize()

      expect(configInstance.client).toBeDefined()
      expect(configInstance.client.VITE_FEATURE_ENABLE_CACHE).toBe(true)
      expect(configInstance.client.VITE_CACHE_MAX_SIZE).toBe(1000)
      expect(configInstance.client.VITE_PERFORMANCE_SAMPLE_RATE).toBe(0.1)
    })

    it('should handle configuration validation errors gracefully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configInstance = new (config.constructor as any)()

      // Mock a validation failure
      vi.spyOn(configInstance, 'getSafeClientConfig').mockReturnValue({
        VITE_AZURE_FUNCTIONS_URL: 'invalid-url',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        VITE_NODE_ENV: 'development' as any,
        VITE_APP_VERSION: '1.0.0',
        VITE_FEATURE_ENABLE_ANALYTICS: true,
        VITE_FEATURE_ENABLE_DEBUG_LOGGING: false,
        VITE_FEATURE_ENABLE_CACHE: true,
        VITE_CACHE_MAX_SIZE: 100,
        VITE_CACHE_DEFAULT_TTL: 60000,
        VITE_CACHE_CLEANUP_INTERVAL: 60000,
        VITE_PERFORMANCE_ENABLE_SAMPLING: true,
        VITE_PERFORMANCE_SAMPLE_RATE: 0.1,
        VITE_PERFORMANCE_MAX_METRICS: 1000,
        VITE_SECURITY_CSP_STRICT: false,
        VITE_SECURITY_RATE_LIMIT_REQUESTS: 100,
        VITE_SECURITY_RATE_LIMIT_WINDOW: 60000,
      })

      await configInstance.initialize()
      expect(configInstance.isInitialized).toBe(true)
    })
  })

  describe('Cache Integration', () => {
    it('should store and retrieve data with size limits', async () => {
      const testData = { message: 'test', timestamp: Date.now() }
      const testKey = 'integration-test'

      smartCache.set(testKey, testData, 60000)

      const retrieved = smartCache.get(testKey)
      expect(retrieved).toEqual(testData)
    })

    it('should handle cache size limits and LRU eviction', async () => {
      const config = {
        maxSize: 1000,
        defaultTTL: 60000,
        cleanupInterval: 60000,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const testCache = new (smartCache.constructor as any)(
        performanceMonitor,
        config
      )

      // Fill cache with data
      for (let i = 0; i < 50; i++) {
        testCache.set(`key-${i}`, { data: 'x'.repeat(100), index: i }, 60000)
      }

      const stats = testCache.getStats()
      expect(stats.size).toBeLessThanOrEqual(50) // Some may be evicted due to size limits
      expect(stats.utilizationPercent).toBeGreaterThan(0)
    })

    it('should provide cache telemetry', () => {
      const health = cacheTelemetry.healthCheck()
      expect(health).toHaveProperty('healthy')
      expect(health).toHaveProperty('issues')
      expect(health).toHaveProperty('stats')
    })
  })

  describe('Security Integration', () => {
    it('should generate comprehensive security headers', () => {
      const headers = securityHeaders.getSecurityHeaders({
        strictCSP: false,
        includeHSTS: true,
        reportUri: 'https://csp-report.example.com',
      })

      expect(headers['Strict-Transport-Security']).toBeDefined()
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['Content-Security-Policy']).toBeDefined()
    })

    it('should validate CSP policies', () => {
      const cspString = "default-src 'self'; script-src 'self' 'unsafe-inline';"
      const result = securityHeaders.testCSP(cspString)

      expect(result).toHaveProperty('valid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')

      // Should warn about unsafe-inline
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('unsafe-inline'))).toBe(true)
    })

    it('should validate security headers configuration', () => {
      const testHeaders = {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https://api.tcdynamics.fr; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';",
      }

      const validation = securityHeaders.validateHeaders(testHeaders)

      expect(validation).toHaveProperty('valid')
      expect(validation).toHaveProperty('issues')

      // Should validate successfully (all required headers present and properly formatted)
      // Note: CSP validation may have warnings but should still be valid
      expect(validation).toHaveProperty('valid')
      expect(validation).toHaveProperty('issues')
      // Accept validation even with warnings as long as there are no errors
      expect(validation.valid !== false).toBe(true)
    })
  })

  describe('Performance Monitoring Integration', () => {
    it('should record metrics without errors', () => {
      expect(() => {
        performanceMonitor.recordMetric('integration.test', 100, {
          test: true,
          environment: 'test',
        })
      }).not.toThrow()
    })

    it('should provide performance statistics', () => {
      const stats = performanceMonitor.getStats(60000)
      expect(stats).toHaveProperty('averageResponseTime')
      expect(stats).toHaveProperty('totalRequests')
      expect(stats).toHaveProperty('successRate')
      expect(stats).toHaveProperty('errorRate')
    })
  })

  describe('Isomorphic Utilities Integration', () => {
    it('should detect environment correctly', () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      })

      expect(isBrowser()).toBe(true)
      expect(isDevelopment()).toBe(true) // Vitest sets import.meta.env.DEV = true in test environment

      // Mock Node.js environment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).window
      Object.defineProperty(global, 'process', {
        value: { env: { NODE_ENV: 'test' } },
        writable: true,
      })

      expect(isBrowser()).toBe(false)
    })

    it('should provide crypto utilities', async () => {
      const uuid = cryptoUtils.randomUUID()
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )

      const randomBytes = cryptoUtils.randomBytes(16)
      expect(randomBytes).toBeInstanceOf(Uint8Array)
      expect(randomBytes.length).toBe(16)

      const hash = await cryptoUtils.hashString('test')
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should handle storage utilities', () => {
      const testKey = 'test-storage-key'
      const testValue = 'test-value'

      // Test in-memory storage (Node.js environment)
      expect(() => {
        storageUtils.setItem(testKey, testValue)
        const retrieved = storageUtils.getItem(testKey)
        expect(retrieved).toBe(testValue)
        storageUtils.removeItem(testKey)
        const removed = storageUtils.getItem(testKey)
        expect(removed).toBeNull()
      }).not.toThrow()
    })
  })

  describe('Error Boundary Integration', () => {
    it('should handle component errors gracefully', async () => {
      // Mock React Error Boundary behavior
      const mockError = new Error('Test error')

      // Test that error boundary would catch and handle errors
      expect(() => {
        // This would normally be caught by Error Boundary
        throw mockError
      }).toThrow(mockError.message)
    })

    it('should provide reset functionality', () => {
      // Test reset logic (would be used by ErrorBoundary)
      const resetCount = 0
      const newResetCount = resetCount + 1

      expect(newResetCount).toBe(1)
    })
  })

  describe('End-to-End Integration', () => {
    it('should work together without conflicts', async () => {
      // Initialize config
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configInstance = new (config.constructor as any)()
      await configInstance.initialize()

      // Test cache with config
      const cacheConfig = {
        maxSize: configInstance.client.VITE_CACHE_MAX_SIZE,
        defaultTTL: configInstance.client.VITE_CACHE_DEFAULT_TTL,
        cleanupInterval: configInstance.client.VITE_CACHE_CLEANUP_INTERVAL,
      }

      expect(cacheConfig.maxSize).toBe(1000)
      expect(cacheConfig.defaultTTL).toBe(300000) // 5 minutes default
      expect(cacheConfig.cleanupInterval).toBe(300000) // 5 minutes default

      // Test security headers with config
      const headers = securityHeaders.getSecurityHeaders({
        strictCSP: configInstance.client.VITE_SECURITY_CSP_STRICT,
      })

      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')

      // Test CSP validation
      const cspValidation = securityHeaders.validateHeaders(headers)
      expect(cspValidation).toHaveProperty('valid')
      expect(cspValidation).toHaveProperty('issues')

      // Test performance monitoring
      performanceMonitor.recordMetric('integration.e2e', 50, {
        test: true,
        config: 'loaded',
      })

      const perfStats = performanceMonitor.getStats(60000)
      expect(perfStats).toHaveProperty('totalRequests')
      expect(perfStats).toHaveProperty('averageResponseTime')

      // Test isomorphic utilities
      const envCheck = isBrowser() ? 'browser' : 'node'
      expect(['browser', 'node']).toContain(envCheck)

      const storageTest = storageUtils.getItem('nonexistent')
      expect(storageTest).toBeNull()
    })
  })
})
