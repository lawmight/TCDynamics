// src/utils/config.ts
// Configuration management with validation and environment variable handling

import { z } from 'zod'

import { logger } from './logger'

class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigValidationError'
  }
}

const DEFAULT_API_BASE_URL = '/api' // Use relative URLs for Vercel API routes

// ========== ENVIRONMENT VARIABLE SCHEMAS ==========

const clientConfigSchema = z.object({
  // API URLs
  VITE_API_URL: z.union([z.string(), z.undefined()]).optional(),
  VITE_AZURE_FUNCTIONS_URL: z.union([z.string(), z.undefined()]).optional(),

  // Environment
  VITE_NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VITE_APP_VERSION: z.string().default('1.0.0'),

  // Analytics (optional)
  VITE_ANALYTICS_GA_TRACKING_ID: z
    .union([z.string(), z.undefined()])
    .optional(),
  VITE_ANALYTICS_HOTJAR_ID: z.union([z.string(), z.undefined()]).optional(),

  // Feature flags (booleans)
  VITE_FEATURE_ENABLE_ANALYTICS: z.boolean().default(false),
  VITE_FEATURE_ENABLE_DEBUG_LOGGING: z.boolean().default(false),
  VITE_FEATURE_ENABLE_CACHE: z.boolean().default(true),
  VITE_FEATURE_ENABLE_AI_CHAT: z.boolean().default(false),
  VITE_FEATURE_ENABLE_AI_VISION: z.boolean().default(false),
  VITE_FEATURE_ENABLE_CONTACT_FORM: z.boolean().default(true),
  VITE_FEATURE_ENABLE_DEMO_FORM: z.boolean().default(true),
  VITE_FEATURE_ENABLE_AZURE_FUNCTIONS: z.boolean().default(false),
  VITE_FEATURE_ENABLE_VERCEL_CHAT: z.boolean().default(false),

  // Cache configuration (numbers)
  VITE_CACHE_MAX_SIZE: z.number().int().positive().default(1000),
  VITE_CACHE_DEFAULT_TTL: z.number().int().positive().default(300000), // 5 minutes
  VITE_CACHE_CLEANUP_INTERVAL: z.number().int().positive().default(300000), // 5 minutes

  // Performance monitoring
  VITE_PERFORMANCE_ENABLE_SAMPLING: z.boolean().default(true),
  VITE_PERFORMANCE_SAMPLE_RATE: z.number().min(0).max(1).default(0.1), // 10% sampling
  VITE_PERFORMANCE_MAX_METRICS: z.number().int().positive().default(1000),

  // Security
  VITE_SECURITY_CSP_STRICT: z.boolean().default(false),
  VITE_SECURITY_RATE_LIMIT_REQUESTS: z.number().int().positive().default(100),
  VITE_SECURITY_RATE_LIMIT_WINDOW: z.number().int().positive().default(60000), // 1 minute
})

const serverConfigSchema = z.object({
  // Azure OpenAI
  AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
  AZURE_OPENAI_KEY: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT: z.string().default('gpt-35-turbo'),

  // Azure Vision
  AZURE_VISION_ENDPOINT: z.string().url().optional(),
  AZURE_VISION_KEY: z.string().optional(),

  // Email configuration
  ZOHO_EMAIL: z.string().email().optional(),
  ZOHO_PASSWORD: z.string().optional(),

  // Database
  COSMOS_CONNECTION_STRING: z.string().optional(),

  // Security
  ADMIN_KEY: z.string().min(32).optional(),
  FRONTEND_URL: z.string().url().default('https://tcdynamics.fr'),

  // Application Insights
  APPLICATIONINSIGHTS_CONNECTION_STRING: z.string().optional(),

  // Azure Storage
  AzureWebJobsStorage: z.string().optional(),
})

// ========== CONFIGURATION MANAGER ==========

class ConfigManager {
  private clientConfig: z.infer<typeof clientConfigSchema>
  private serverConfig: z.infer<typeof serverConfigSchema>
  private isInitialized = false
  private initializationError?: Error

  constructor() {
    this.clientConfig = {} as z.infer<typeof clientConfigSchema>
    this.serverConfig = {} as z.infer<typeof serverConfigSchema>
  }

  /**
   * Get safe client configuration with defaults
   */
  private getSafeClientConfig(): z.infer<typeof clientConfigSchema> {
    const env = this.loadClientEnvironmentVariables()

    // Apply safe defaults for missing or invalid values
    return {
      VITE_API_URL: env.VITE_API_URL || DEFAULT_API_BASE_URL,
      VITE_NODE_ENV:
        (env.VITE_NODE_ENV as 'development' | 'production' | 'test') ||
        'development',
      VITE_APP_VERSION: env.VITE_APP_VERSION || '1.0.0',
      VITE_AZURE_FUNCTIONS_URL: env.VITE_AZURE_FUNCTIONS_URL,
      VITE_ANALYTICS_GA_TRACKING_ID: env.VITE_ANALYTICS_GA_TRACKING_ID,
      VITE_ANALYTICS_HOTJAR_ID: env.VITE_ANALYTICS_HOTJAR_ID,
      VITE_FEATURE_ENABLE_ANALYTICS:
        env.VITE_FEATURE_ENABLE_ANALYTICS === 'true' ||
        env.VITE_FEATURE_ENABLE_ANALYTICS === true,
      VITE_FEATURE_ENABLE_DEBUG_LOGGING:
        env.VITE_FEATURE_ENABLE_DEBUG_LOGGING === 'true' ||
        env.VITE_FEATURE_ENABLE_DEBUG_LOGGING === true,
      VITE_FEATURE_ENABLE_CACHE:
        env.VITE_FEATURE_ENABLE_CACHE !== 'false' &&
        env.VITE_FEATURE_ENABLE_CACHE !== false, // Default true
      VITE_FEATURE_ENABLE_AI_CHAT:
        env.VITE_FEATURE_ENABLE_AI_CHAT === 'true' ||
        env.VITE_FEATURE_ENABLE_AI_CHAT === true,
      VITE_FEATURE_ENABLE_AI_VISION:
        env.VITE_FEATURE_ENABLE_AI_VISION === 'true' ||
        env.VITE_FEATURE_ENABLE_AI_VISION === true,
      VITE_FEATURE_ENABLE_CONTACT_FORM:
        env.VITE_FEATURE_ENABLE_CONTACT_FORM !== 'false' &&
        env.VITE_FEATURE_ENABLE_CONTACT_FORM !== false, // Default true
      VITE_FEATURE_ENABLE_DEMO_FORM:
        env.VITE_FEATURE_ENABLE_DEMO_FORM !== 'false' &&
        env.VITE_FEATURE_ENABLE_DEMO_FORM !== false, // Default true
      VITE_FEATURE_ENABLE_AZURE_FUNCTIONS:
        env.VITE_FEATURE_ENABLE_AZURE_FUNCTIONS === 'true' ||
        env.VITE_FEATURE_ENABLE_AZURE_FUNCTIONS === true,
      VITE_FEATURE_ENABLE_VERCEL_CHAT:
        env.VITE_FEATURE_ENABLE_VERCEL_CHAT === 'true' ||
        env.VITE_FEATURE_ENABLE_VERCEL_CHAT === true,
      VITE_CACHE_MAX_SIZE: Math.max(
        100,
        parseInt(env.VITE_CACHE_MAX_SIZE || '1000', 10)
      ),
      VITE_CACHE_DEFAULT_TTL: Math.max(
        60000,
        parseInt(env.VITE_CACHE_DEFAULT_TTL || '300000', 10)
      ), // Min 1 minute
      VITE_CACHE_CLEANUP_INTERVAL: Math.max(
        60000,
        parseInt(env.VITE_CACHE_CLEANUP_INTERVAL || '300000', 10)
      ),
      VITE_PERFORMANCE_ENABLE_SAMPLING:
        env.VITE_PERFORMANCE_ENABLE_SAMPLING !== 'false',
      VITE_PERFORMANCE_SAMPLE_RATE: Math.max(
        0.01,
        Math.min(1, parseFloat(env.VITE_PERFORMANCE_SAMPLE_RATE || '0.1'))
      ),
      VITE_PERFORMANCE_MAX_METRICS: Math.max(
        100,
        parseInt(env.VITE_PERFORMANCE_MAX_METRICS || '1000', 10)
      ),
      VITE_SECURITY_CSP_STRICT: env.VITE_SECURITY_CSP_STRICT === 'true',
      VITE_SECURITY_RATE_LIMIT_REQUESTS: Math.max(
        10,
        parseInt(env.VITE_SECURITY_RATE_LIMIT_REQUESTS || '100', 10)
      ),
      VITE_SECURITY_RATE_LIMIT_WINDOW: Math.max(
        10000,
        parseInt(env.VITE_SECURITY_RATE_LIMIT_WINDOW || '60000', 10)
      ),
    }
  }

  /**
   * Get safe server configuration with defaults
   */
  private getSafeServerConfig(): z.infer<typeof serverConfigSchema> {
    const env = this.loadServerEnvironmentVariables()

    return {
      AZURE_OPENAI_ENDPOINT: env.AZURE_OPENAI_ENDPOINT,
      AZURE_OPENAI_KEY: env.AZURE_OPENAI_KEY,
      AZURE_OPENAI_DEPLOYMENT: env.AZURE_OPENAI_DEPLOYMENT || 'gpt-35-turbo',
      AZURE_VISION_ENDPOINT: env.AZURE_VISION_ENDPOINT,
      AZURE_VISION_KEY: env.AZURE_VISION_KEY,
      ZOHO_EMAIL: env.ZOHO_EMAIL,
      ZOHO_PASSWORD: env.ZOHO_PASSWORD,
      COSMOS_CONNECTION_STRING: env.COSMOS_CONNECTION_STRING,
      ADMIN_KEY: env.ADMIN_KEY,
      FRONTEND_URL: env.FRONTEND_URL || 'https://tcdynamics.fr',
      APPLICATIONINSIGHTS_CONNECTION_STRING:
        env.APPLICATIONINSIGHTS_CONNECTION_STRING,
      AzureWebJobsStorage: env.AzureWebJobsStorage,
    }
  }

  /**
   * Initialize configuration from environment variables with safe defaults
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.initializationError = undefined
      // Load and validate client-side configuration with safe defaults
      const safeClientConfig = this.getSafeClientConfig()
      const clientValidation = clientConfigSchema.safeParse(safeClientConfig)

      if (!clientValidation.success) {
        logger.warn(
          'Client configuration validation failed, using safe defaults',
          {
            issues: clientValidation.error.issues,
          }
        )
        this.clientConfig = safeClientConfig
      } else {
        this.clientConfig = clientValidation.data
      }

      // Load and validate server-side configuration (if available)
      const safeServerConfig = this.getSafeServerConfig()
      const serverValidation = serverConfigSchema.safeParse(safeServerConfig)

      if (!serverValidation.success) {
        logger.warn(
          'Server configuration validation failed, using safe defaults',
          {
            issues: serverValidation.error.issues,
          }
        )
        this.serverConfig = safeServerConfig
      } else {
        this.serverConfig = serverValidation.data
      }

      const validation = this.validateConfigs(
        this.clientConfig,
        this.serverConfig
      )

      if (!validation.valid) {
        throw new ConfigValidationError(
          `Missing required configuration: ${validation.missing.join(', ')}`
        )
      }

      this.isInitialized = true
      this.initializationError = undefined
      this.logConfigStatus()

      // Emit config loaded event for other modules
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('configLoaded', { detail: this }))
      }
    } catch (error) {
      logger.error('Configuration initialization failed', error)

      if (error instanceof ConfigValidationError) {
        this.initializationError = error
        throw error
      }

      // Fallback to safe defaults even if validation completely fails
      try {
        this.clientConfig = this.getSafeClientConfig()
        this.serverConfig = this.getSafeServerConfig()
        this.isInitialized = true
        logger.warn(
          'Using safe configuration defaults due to initialization failure'
        )
      } catch (fallbackError) {
        logger.error('Even fallback configuration failed', fallbackError)
        throw new Error(
          `Configuration initialization completely failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }
  }

  /**
   * Load client-side environment variables
   */
  private loadClientEnvironmentVariables(): Record<string, string | undefined> {
    const env: Record<string, string | undefined> = {}

    // Helper to read from process.env first (useful for Vitest) then import.meta.env
    const readEnv = (key: string) => {
      if (typeof process !== 'undefined' && process.env?.[key] !== undefined) {
        return process.env[key]
      }
      return typeof import.meta !== 'undefined'
        ? (
            import.meta as unknown as {
              env?: Record<string, string | undefined>
            }
          ).env?.[key]
        : undefined
    }

    // Client-side variables (prefixed with VITE_)
    const clientVars = [
      'VITE_API_URL',
      'VITE_AZURE_FUNCTIONS_URL',
      'VITE_NODE_ENV',
      'VITE_APP_VERSION',
      'VITE_ANALYTICS_GA_TRACKING_ID',
      'VITE_ANALYTICS_HOTJAR_ID',
      'VITE_FEATURE_ENABLE_ANALYTICS',
      'VITE_FEATURE_ENABLE_DEBUG_LOGGING',
      'VITE_FEATURE_ENABLE_CACHE',
      'VITE_FEATURE_ENABLE_AI_CHAT',
      'VITE_FEATURE_ENABLE_AI_VISION',
      'VITE_FEATURE_ENABLE_CONTACT_FORM',
      'VITE_FEATURE_ENABLE_DEMO_FORM',
      'VITE_FEATURE_ENABLE_AZURE_FUNCTIONS',
      'VITE_FEATURE_ENABLE_VERCEL_CHAT',
      'VITE_CACHE_MAX_SIZE',
      'VITE_CACHE_DEFAULT_TTL',
      'VITE_CACHE_CLEANUP_INTERVAL',
      'VITE_PERFORMANCE_ENABLE_SAMPLING',
      'VITE_PERFORMANCE_SAMPLE_RATE',
      'VITE_PERFORMANCE_MAX_METRICS',
      'VITE_SECURITY_CSP_STRICT',
      'VITE_SECURITY_RATE_LIMIT_REQUESTS',
      'VITE_SECURITY_RATE_LIMIT_WINDOW',
    ]

    clientVars.forEach(key => {
      env[key] = readEnv(key)
    })

    return env
  }

  /**
   * Load server-side environment variables (Azure Functions)
   */
  private loadServerEnvironmentVariables(): Record<string, string | undefined> {
    // In browser environment, server config is not available
    if (typeof window !== 'undefined') {
      return {}
    }

    // This would be used in server-side code (Azure Functions)
    const env: Record<string, string | undefined> = {}

    const serverVars = [
      'AZURE_OPENAI_ENDPOINT',
      'AZURE_OPENAI_KEY',
      'AZURE_OPENAI_DEPLOYMENT',
      'AZURE_VISION_ENDPOINT',
      'AZURE_VISION_KEY',
      'ZOHO_EMAIL',
      'ZOHO_PASSWORD',
      'COSMOS_CONNECTION_STRING',
      'ADMIN_KEY',
      'FRONTEND_URL',
      'APPLICATIONINSIGHTS_CONNECTION_STRING',
      'AzureWebJobsStorage',
    ]

    serverVars.forEach(key => {
      env[key] = process.env[key]
    })

    return env
  }

  /**
   * Log configuration status (safely, without exposing secrets)
   */
  private logConfigStatus(): void {
    const status = {
      client: {
        environment: this.clientConfig.VITE_NODE_ENV,
        apiUrl: this.clientConfig.VITE_API_URL ? 'configured' : 'default',
        analytics: this.clientConfig.VITE_FEATURE_ENABLE_ANALYTICS,
        debugLogging: this.clientConfig.VITE_FEATURE_ENABLE_DEBUG_LOGGING,
        cache: this.clientConfig.VITE_FEATURE_ENABLE_CACHE,
        cacheSize: this.clientConfig.VITE_CACHE_MAX_SIZE,
        performanceSampling: this.clientConfig.VITE_PERFORMANCE_ENABLE_SAMPLING,
        securityStrict: this.clientConfig.VITE_SECURITY_CSP_STRICT,
      },
      server: {
        openai: this.serverConfig.AZURE_OPENAI_ENDPOINT
          ? 'configured'
          : 'missing',
        vision: this.serverConfig.AZURE_VISION_ENDPOINT
          ? 'configured'
          : 'missing',
        email: this.serverConfig.ZOHO_EMAIL ? 'configured' : 'missing',
        database: this.serverConfig.COSMOS_CONNECTION_STRING
          ? 'configured'
          : 'missing',
        adminKey: this.serverConfig.ADMIN_KEY ? 'configured' : 'missing',
      },
    }

    logger.info('Configuration status check completed', status)
  }

  // ========== GETTERS ==========

  get client() {
    this.ensureInitialized()
    return this.clientConfig
  }

  get server() {
    this.ensureInitialized()
    return this.serverConfig
  }

  get isDevelopment(): boolean {
    return this.client.VITE_NODE_ENV === 'development'
  }

  get isProduction(): boolean {
    return this.client.VITE_NODE_ENV === 'production'
  }

  get apiBaseUrl(): string {
    return this.client.VITE_API_URL || DEFAULT_API_BASE_URL
  }

  get functionsBaseUrl(): string {
    this.ensureInitialized()

    if (this.client.VITE_FEATURE_ENABLE_AZURE_FUNCTIONS) {
      if (!this.client.VITE_AZURE_FUNCTIONS_URL) {
        throw new ConfigValidationError(
          'VITE_AZURE_FUNCTIONS_URL is required when VITE_FEATURE_ENABLE_AZURE_FUNCTIONS is enabled'
        )
      }
      return this.client.VITE_AZURE_FUNCTIONS_URL
    }

    return this.apiBaseUrl
  }

  // ========== UTILITY METHODS ==========

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      if (this.initializationError) {
        throw this.initializationError
      }

      throw new Error('Configuration not initialized. Call initialize() first.')
    }
  }

  /**
   * Validate all required configurations are present
   */
  validateRequiredConfigs(): { valid: boolean; missing: string[] } {
    this.ensureInitialized()

    return this.validateConfigs(this.clientConfig, this.serverConfig)
  }

  private validateConfigs(
    clientConfig: z.infer<typeof clientConfigSchema>,
    serverConfig: z.infer<typeof serverConfigSchema>
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = []

    // Check client-side required configs

    if (
      clientConfig.VITE_FEATURE_ENABLE_AZURE_FUNCTIONS &&
      !clientConfig.VITE_AZURE_FUNCTIONS_URL
    ) {
      missing.push('VITE_AZURE_FUNCTIONS_URL')
    }

    const isTestEnv =
      process.env.VITEST === 'true' ||
      process.env.NODE_ENV === 'test' ||
      clientConfig.VITE_NODE_ENV === 'test'

    // Check server-side required configs (only if we're on server and not in test)
    if (typeof window === 'undefined' && !isTestEnv) {
      const requiredServer = [
        'AZURE_OPENAI_ENDPOINT',
        'AZURE_OPENAI_KEY',
        'AZURE_VISION_ENDPOINT',
        'AZURE_VISION_KEY',
        'ZOHO_EMAIL',
        'ZOHO_PASSWORD',
        'ADMIN_KEY',
      ]

      requiredServer.forEach(key => {
        if (!serverConfig[key as keyof typeof serverConfig]) {
          missing.push(key)
        }
      })
    }

    return {
      valid: missing.length === 0,
      missing,
    }
  }

  /**
   * Get a safe configuration summary (without secrets)
   */
  getSafeConfigSummary(): {
    environment: string
    version: string
    apiUrl: string
    functionsUrl: string
    features: {
      analytics: boolean
      debugLogging: boolean
      cache: boolean
      performanceSampling: boolean
      securityStrict: boolean
    }
    services: {
      openai: boolean
      vision: boolean
      email: boolean
      database: boolean
    }
  } {
    return {
      environment: this.client.VITE_NODE_ENV,
      version: this.client.VITE_APP_VERSION,
      apiUrl: this.apiBaseUrl,
      functionsUrl: this.functionsBaseUrl,
      features: {
        analytics: this.client.VITE_FEATURE_ENABLE_ANALYTICS,
        debugLogging: this.client.VITE_FEATURE_ENABLE_DEBUG_LOGGING,
        cache: this.client.VITE_FEATURE_ENABLE_CACHE,
        performanceSampling: this.client.VITE_PERFORMANCE_ENABLE_SAMPLING,
        securityStrict: this.client.VITE_SECURITY_CSP_STRICT,
      },
      services: {
        openai: !!this.server.AZURE_OPENAI_ENDPOINT,
        vision: !!this.server.AZURE_VISION_ENDPOINT,
        email: !!this.server.ZOHO_EMAIL,
        database: !!this.server.COSMOS_CONNECTION_STRING,
      },
    }
  }
}

// ========== SINGLETON INSTANCE ==========

export { ConfigManager }
export const config = new ConfigManager()

// ========== ENVIRONMENT VARIABLE HELPERS ==========

export const envHelpers = {
  /**
   * Get environment variable with fallback
   */
  getEnvVar: (key: string, fallback?: string): string => {
    const value =
      (typeof process !== 'undefined' ? process.env[key] : undefined) ||
      (typeof import.meta !== 'undefined' ? import.meta.env[key] : undefined) ||
      fallback
    if (!value) {
      throw new Error(`Environment variable ${key} is required but not set`)
    }
    return value
  },

  /**
   * Get boolean environment variable
   */
  getBooleanEnvVar: (key: string, fallback = false): boolean => {
    const value =
      (typeof process !== 'undefined' ? process.env[key] : undefined) ??
      (typeof import.meta !== 'undefined' ? import.meta.env[key] : undefined)
    if (value === undefined) return fallback
    return value === 'true' || value === '1'
  },

  /**
   * Get number environment variable
   */
  getNumberEnvVar: (key: string, fallback?: number): number => {
    const value =
      (typeof process !== 'undefined' ? process.env[key] : undefined) ??
      (typeof import.meta !== 'undefined' ? import.meta.env[key] : undefined)
    if (value === undefined) {
      if (fallback !== undefined) return fallback
      throw new Error(`Environment variable ${key} is required but not set`)
    }
    const parsed = parseFloat(value)
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} is not a valid number`)
    }
    return parsed
  },

  /**
   * Validate URL format
   */
  validateUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
}

// ========== INITIALIZATION ==========

// Auto-initialize configuration when module is loaded
if (typeof window !== 'undefined') {
  // Client-side initialization
  config.initialize().catch(error => {
    logger.error('Failed to initialize client configuration', error)
  })
}
