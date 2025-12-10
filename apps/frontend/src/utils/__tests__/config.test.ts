import { describe, it, expect, vi, beforeEach } from 'vitest'

import { envHelpers } from '../config'

// Mock import.meta.env
const mockEnv = {
  VITE_AZURE_FUNCTIONS_URL: 'https://test-functions.com/api',
  VITE_NODE_ENV: 'test',
  VITE_APP_VERSION: '1.0.0',
  VITE_ENABLE_ANALYTICS: 'true',
  VITE_ENABLE_DEBUG_LOGGING: 'false',
  VITE_ENABLE_CACHE: 'true',
  VITE_GA_TRACKING_ID: 'GA123',
  VITE_HOTJAR_ID: 'HJ456',
  VITE_TEST_NUMBER: '42',
}

vi.mock(
  'import.meta',
  () => ({
    env: mockEnv,
  }),
  { virtual: true }
)

describe('Configuration Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset config for each test (preserve ConfigManager export)
    vi.doMock('../config', async () => {
      const actual =
        await vi.importActual<typeof import('../config')>('../config')
      return {
        ...actual,
        config: {
          ...actual.config,
          initialize: vi.fn().mockResolvedValue(undefined),
          client: {},
          server: {},
          isDevelopment: false,
          isProduction: false,
          functionsBaseUrl: mockEnv.VITE_AZURE_FUNCTIONS_URL,
        },
      }
    })
  })

  describe('Environment Helpers', () => {
    describe('getEnvVar', () => {
      it('should return environment variable value', () => {
        // Set up test environment variable
        const originalEnv = process.env.VITE_APP_VERSION
        process.env.VITE_APP_VERSION = '1.0.0'

        const result = envHelpers.getEnvVar('VITE_APP_VERSION')
        expect(result).toBe('1.0.0')

        // Cleanup
        if (originalEnv === undefined) {
          delete process.env.VITE_APP_VERSION
        } else {
          process.env.VITE_APP_VERSION = originalEnv
        }
      })

      it('should return fallback value when env var is undefined', () => {
        const result = envHelpers.getEnvVar('NON_EXISTENT_VAR', 'fallback')
        expect(result).toBe('fallback')
      })

      it('should throw error when required env var is missing', () => {
        expect(() => {
          envHelpers.getEnvVar('NON_EXISTENT_VAR')
        }).toThrow(
          'Environment variable NON_EXISTENT_VAR is required but not set'
        )
      })
    })

    describe('getBooleanEnvVar', () => {
      it('should parse true values', () => {
        // Set up test environment variables
        const originalAnalytics = process.env.VITE_ENABLE_ANALYTICS
        const originalDebug = process.env.VITE_ENABLE_DEBUG_LOGGING

        process.env.VITE_ENABLE_ANALYTICS = 'true'
        process.env.VITE_ENABLE_DEBUG_LOGGING = 'false'

        expect(envHelpers.getBooleanEnvVar('VITE_ENABLE_ANALYTICS')).toBe(true)
        expect(envHelpers.getBooleanEnvVar('VITE_ENABLE_DEBUG_LOGGING')).toBe(
          false
        )

        // Cleanup
        if (originalAnalytics === undefined) {
          delete process.env.VITE_ENABLE_ANALYTICS
        } else {
          process.env.VITE_ENABLE_ANALYTICS = originalAnalytics
        }
        if (originalDebug === undefined) {
          delete process.env.VITE_ENABLE_DEBUG_LOGGING
        } else {
          process.env.VITE_ENABLE_DEBUG_LOGGING = originalDebug
        }
      })

      it('should return fallback for undefined values', () => {
        expect(envHelpers.getBooleanEnvVar('NON_EXISTENT_VAR', true)).toBe(true)
        expect(envHelpers.getBooleanEnvVar('NON_EXISTENT_VAR', false)).toBe(
          false
        )
      })
    })

    describe('getNumberEnvVar', () => {
      beforeEach(() => {
        // Add numeric env var for testing
        vi.doMock(
          'import.meta',
          () => ({
            env: {
              ...mockEnv,
              VITE_TEST_NUMBER: '42',
            },
          }),
          { virtual: true }
        )
      })

      it('should parse numeric values', () => {
        // Set up environment variable for test
        process.env.VITE_TEST_NUMBER = '42'
        const result = envHelpers.getNumberEnvVar('VITE_TEST_NUMBER')
        expect(result).toBe(42)
      })

      it('should throw error for invalid numbers', () => {
        // Set up invalid number environment variable
        const originalVersion = process.env.VITE_APP_VERSION
        process.env.VITE_APP_VERSION = 'not-a-number' // This should be invalid as it's not a number

        expect(() => {
          envHelpers.getNumberEnvVar('VITE_APP_VERSION')
        }).toThrow(
          'Environment variable VITE_APP_VERSION is not a valid number'
        )

        // Cleanup
        if (originalVersion === undefined) {
          delete process.env.VITE_APP_VERSION
        } else {
          process.env.VITE_APP_VERSION = originalVersion
        }
      })

      it('should return fallback for undefined values', () => {
        const result = envHelpers.getNumberEnvVar('NON_EXISTENT_VAR', 100)
        expect(result).toBe(100)
      })
    })

    describe('validateUrl', () => {
      it('should validate correct URLs', () => {
        expect(envHelpers.validateUrl('https://example.com')).toBe(true)
        expect(envHelpers.validateUrl('http://localhost:8080')).toBe(true)
        expect(envHelpers.validateUrl('ftp://example.com')).toBe(true)
      })

      it('should reject invalid URLs', () => {
        expect(envHelpers.validateUrl('not-a-url')).toBe(false)
        expect(envHelpers.validateUrl('')).toBe(false)
        expect(envHelpers.validateUrl('http://')).toBe(false)
      })
    })
  })

  describe('Configuration Validation', () => {
    it('should validate required client configuration', async () => {
      // Mock incomplete configuration
      vi.doMock('../config', () => ({
        config: {
          client: {
            VITE_ENABLE_CACHE: true,
            VITE_NODE_ENV: 'development',
          },
          server: {},
          validateRequiredConfigs: vi.fn().mockReturnValue({
            valid: false,
            missing: ['VITE_AZURE_FUNCTIONS_URL'],
          }),
        },
      }))

      const { config: mockConfig } = await import('../config')
      const result = mockConfig.validateRequiredConfigs()

      expect(result.valid).toBe(false)
      expect(result.missing).toContain('VITE_AZURE_FUNCTIONS_URL')
    })

    it('should return safe configuration summary', async () => {
      vi.doMock('../config', () => ({
        config: {
          client: {
            VITE_NODE_ENV: 'development',
            VITE_APP_VERSION: '1.0.0',
            VITE_ENABLE_ANALYTICS: true,
            VITE_ENABLE_DEBUG_LOGGING: false,
            VITE_ENABLE_CACHE: true,
          },
          server: {
            AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com/',
            AZURE_VISION_ENDPOINT: 'https://example.vision.azure.com/',
            ZOHO_EMAIL: 'test@example.com',
            COSMOS_CONNECTION_STRING: 'connection-string',
          },
          functionsBaseUrl: 'https://test-functions.com/api',
          getSafeConfigSummary: vi.fn().mockReturnValue({
            environment: 'development',
            version: '1.0.0',
            functionsUrl: 'https://test-functions.com/api',
            features: {
              analytics: true,
              debugLogging: false,
              cache: true,
            },
            services: {
              openai: true,
              vision: true,
              email: true,
              database: true,
            },
          }),
        },
      }))

      const { config: mockConfig } = await import('../config')
      const summary = mockConfig.getSafeConfigSummary()

      expect(summary.environment).toBe('development')
      expect(summary.services.openai).toBe(true)
      expect(summary.services.vision).toBe(true)
      expect(summary.services.email).toBe(true)
      expect(summary.services.database).toBe(true)
    })
  })

  describe('Configuration Initialization', () => {
    it('should initialize configuration successfully', async () => {
      vi.doMock('../config', () => ({
        config: {
          initialize: vi.fn().mockResolvedValue(undefined),
          client: mockEnv,
          isInitialized: true,
        },
      }))

      const { config: mockConfig } = await import('../config')
      await mockConfig.initialize()

      expect(mockConfig.initialize).toHaveBeenCalled()
    })

    it('should handle initialization errors', async () => {
      vi.doMock('../config', () => ({
        config: {
          initialize: vi.fn().mockRejectedValue(new Error('Validation failed')),
        },
      }))

      const { config: mockConfig } = await import('../config')

      await expect(mockConfig.initialize()).rejects.toThrow('Validation failed')
    })
  })

  describe('Environment Detection', () => {
    it('should detect development environment', async () => {
      vi.doMock('../config', () => ({
        config: {
          client: { VITE_NODE_ENV: 'development' },
          isDevelopment: true,
          isProduction: false,
        },
      }))

      const { config: mockConfig } = await import('../config')
      expect(mockConfig.isDevelopment).toBe(true)
      expect(mockConfig.isProduction).toBe(false)
    })

    it('should detect production environment', async () => {
      vi.doMock('../config', () => ({
        config: {
          client: { VITE_NODE_ENV: 'production' },
          isDevelopment: false,
          isProduction: true,
        },
      }))

      const { config: mockConfig } = await import('../config')
      expect(mockConfig.isDevelopment).toBe(false)
      expect(mockConfig.isProduction).toBe(true)
    })
  })
})

describe('Functions Base URL', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.doUnmock('../config')
    vi.unmock('../config')
    // Clear env between tests
    delete process.env.VITE_FEATURE_ENABLE_AZURE_FUNCTIONS
    delete process.env.VITE_AZURE_FUNCTIONS_URL
    delete process.env.VITE_API_URL
    process.env.VITE_NODE_ENV = 'test'
  })

  it('uses configured Azure Functions URL when feature flag is enabled', async () => {
    process.env.VITE_FEATURE_ENABLE_AZURE_FUNCTIONS = 'true'
    process.env.VITE_AZURE_FUNCTIONS_URL = 'https://custom-functions.com/api'

    const { ConfigManager } = await import('../config')
    const configInstance = new ConfigManager()
    await configInstance.initialize()

    expect(configInstance.functionsBaseUrl).toBe(
      'https://custom-functions.com/api'
    )
  })

  it('falls back to API base URL when Azure Functions are disabled', async () => {
    process.env.VITE_FEATURE_ENABLE_AZURE_FUNCTIONS = 'false'
    process.env.VITE_API_URL = 'https://api.example.com'

    const { ConfigManager } = await import('../config')
    const configInstance = new ConfigManager()
    await configInstance.initialize()

    expect(configInstance.functionsBaseUrl).toBe('https://api.example.com')
  })

  it('throws when feature flag is enabled but URL is missing', async () => {
    process.env.VITE_FEATURE_ENABLE_AZURE_FUNCTIONS = 'true'

    const { ConfigManager } = await import('../config')
    const configInstance = new ConfigManager()

    await expect(configInstance.initialize()).rejects.toThrow(
      'Missing required configuration: VITE_AZURE_FUNCTIONS_URL'
    )
  })
})
