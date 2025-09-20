// src/utils/config.ts
// Configuration management with validation and environment variable handling

import { z } from 'zod'

// ========== ENVIRONMENT VARIABLE SCHEMAS ==========

const clientConfigSchema = z.object({
  // API URLs
  VITE_AZURE_FUNCTIONS_URL: z.string().url().optional(),

  // Environment
  VITE_NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VITE_APP_VERSION: z.string().default('1.0.0'),

  // Analytics (optional)
  VITE_GA_TRACKING_ID: z.string().optional(),
  VITE_HOTJAR_ID: z.string().optional(),

  // Feature flags
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  VITE_ENABLE_DEBUG_LOGGING: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  VITE_ENABLE_CACHE: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
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

  constructor() {
    this.clientConfig = {} as any
    this.serverConfig = {} as any
  }

  /**
   * Initialize configuration from environment variables
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load client-side configuration
      const clientEnv = this.loadClientEnvironmentVariables()
      this.clientConfig = clientConfigSchema.parse(clientEnv)

      // Load server-side configuration (if available)
      const serverEnv = this.loadServerEnvironmentVariables()
      this.serverConfig = serverConfigSchema.parse(serverEnv)

      this.isInitialized = true
      this.logConfigStatus()
    } catch (error) {
      console.error('Configuration initialization failed:', error)
      throw new Error(
        `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Load client-side environment variables
   */
  private loadClientEnvironmentVariables(): Record<string, string | undefined> {
    const env: Record<string, string | undefined> = {}

    // Client-side variables (prefixed with VITE_)
    const clientVars = [
      'VITE_AZURE_FUNCTIONS_URL',
      'VITE_NODE_ENV',
      'VITE_APP_VERSION',
      'VITE_GA_TRACKING_ID',
      'VITE_HOTJAR_ID',
      'VITE_ENABLE_ANALYTICS',
      'VITE_ENABLE_DEBUG_LOGGING',
      'VITE_ENABLE_CACHE',
    ]

    clientVars.forEach(key => {
      env[key] = import.meta.env[key]
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
        functionsUrl: this.clientConfig.VITE_AZURE_FUNCTIONS_URL
          ? 'configured'
          : 'default',
        analytics: this.clientConfig.VITE_ENABLE_ANALYTICS,
        debugLogging: this.clientConfig.VITE_ENABLE_DEBUG_LOGGING,
        cache: this.clientConfig.VITE_ENABLE_CACHE,
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

    console.log('Configuration Status:', status)
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

  get functionsBaseUrl(): string {
    return (
      this.client.VITE_AZURE_FUNCTIONS_URL ||
      'https://func-tcdynamics-contact-bjgwe4aaaza9dpbk.francecentral-01.azurewebsites.net/api'
    )
  }

  // ========== UTILITY METHODS ==========

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Configuration not initialized. Call initialize() first.')
    }
  }

  /**
   * Validate all required configurations are present
   */
  validateRequiredConfigs(): { valid: boolean; missing: string[] } {
    const missing: string[] = []

    // Check client-side required configs
    if (!this.client.VITE_AZURE_FUNCTIONS_URL) {
      missing.push('VITE_AZURE_FUNCTIONS_URL')
    }

    // Check server-side required configs (only if we're on server)
    if (typeof window === 'undefined') {
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
        if (!this.serverConfig[key as keyof typeof this.serverConfig]) {
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
  getSafeConfigSummary(): Record<string, any> {
    return {
      environment: this.client.VITE_NODE_ENV,
      version: this.client.VITE_APP_VERSION,
      functionsUrl: this.functionsBaseUrl,
      features: {
        analytics: this.client.VITE_ENABLE_ANALYTICS,
        debugLogging: this.client.VITE_ENABLE_DEBUG_LOGGING,
        cache: this.client.VITE_ENABLE_CACHE,
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

export const config = new ConfigManager()

// ========== ENVIRONMENT VARIABLE HELPERS ==========

export const envHelpers = {
  /**
   * Get environment variable with fallback
   */
  getEnvVar: (key: string, fallback?: string): string => {
    const value = import.meta.env[key] || fallback
    if (!value) {
      throw new Error(`Environment variable ${key} is required but not set`)
    }
    return value
  },

  /**
   * Get boolean environment variable
   */
  getBooleanEnvVar: (key: string, fallback = false): boolean => {
    const value = import.meta.env[key]
    if (value === undefined) return fallback
    return value === 'true' || value === '1'
  },

  /**
   * Get number environment variable
   */
  getNumberEnvVar: (key: string, fallback?: number): number => {
    const value = import.meta.env[key]
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
    console.error('Failed to initialize client configuration:', error)
  })
}
