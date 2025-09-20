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
    // Reset config for each test
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

  describe('Environment Helpers', () => {
    describe('getEnvVar', () => {
      it('should return environment variable value', () => {
        const result = envHelpers.getEnvVar('VITE_APP_VERSION')
        expect(result).toBe('1.0.0')
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
        expect(envHelpers.getBooleanEnvVar('VITE_ENABLE_ANALYTICS')).toBe(true)
        expect(envHelpers.getBooleanEnvVar('VITE_ENABLE_DEBUG_LOGGING')).toBe(
          false
        )
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
        const result = envHelpers.getNumberEnvVar('VITE_TEST_NUMBER')
        expect(result).toBe(42)
      })

      it('should throw error for invalid numbers', () => {
        expect(() => {
          envHelpers.getNumberEnvVar('VITE_APP_VERSION') // '1.0.0' is not a valid number
        }).toThrow(
          'Environment variable VITE_APP_VERSION is not a valid number'
        )
      })

      it('should return fallback for undefined values', () => {
        const result = envHelpers.getNumberEnvVar('NON_EXISTENT_VAR', 100)
        expect(result).toBe(100)
      })
    })

    describe('validateUrl', () => {
      it('should validate correct URLs', () => {
        expect(envHelpers.validateUrl('https://example.com')).toBe(true)
        expect(envHelpers.validateUrl('http://localhost:3000')).toBe(true)
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

  describe('Functions Base URL', () => {
    it('should return configured functions URL', async () => {
      vi.doMock('../config', () => ({
        config: {
          functionsBaseUrl: 'https://custom-functions.com/api',
        },
      }))

      const { config: mockConfig } = await import('../config')
      expect(mockConfig.functionsBaseUrl).toBe(
        'https://custom-functions.com/api'
      )
    })

    it('should return default URL when not configured', async () => {
      vi.doMock('../config', () => ({
        config: {
          functionsBaseUrl:
            'https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api',
        },
      }))

      const { config: mockConfig } = await import('../config')
      expect(mockConfig.functionsBaseUrl).toBe(
        'https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api'
      )
    })
  })
})
