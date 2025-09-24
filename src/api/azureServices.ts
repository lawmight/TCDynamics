// src/api/azureServices.ts
// Centralized API client for TCDynamics Azure Functions with comprehensive error handling,
// retry logic, type safety, and performance optimizations

import { z } from 'zod'
import { sanitizeInput, rateLimiters, contentSecurity } from '@/utils/security'
import { config } from '@/utils/config'
import { performanceMonitor, smartCache } from '@/utils/performance'

// ========== CONFIGURATION ==========

const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  cacheEnabled: config.client.VITE_FEATURE_ENABLE_CACHE,
  cacheTTL: config.client.VITE_CACHE_DEFAULT_TTL || 300000, // 5 minutes
} as const

// Get functions base URL from config
const getFunctionsBaseUrl = (): string => config.functionsBaseUrl

// ========== TYPE DEFINITIONS ==========

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  metadata?: {
    requestId?: string
    timestamp?: string
    duration?: number
  }
}

export interface ContactFormData {
  name: string
  email: string
  message: string
  phone?: string
  company?: string
}

export interface DemoFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  employees?: string
  needs?: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  sessionId: string
  temperature?: number
  maxTokens?: number
}

export interface ChatResponse {
  message: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface VisionRequest {
  imageData: string
  analyzeText?: boolean
}

export interface VisionResponse {
  data: {
    description?: string
    categories?: Array<{ name: string; score: number }>
    color?: {
      dominantColors?: string[]
      accentColor?: string
      isBlackAndWhite?: boolean
    }
    tags?: Array<{ name: string; confidence: number }>
    metadata?: {
      requestId?: string
      modelVersion?: string
      timestamp?: string
    }
  }
}

export interface PaymentIntentRequest {
  amount: number // Montant en centimes
  currency?: string
  plan: 'starter' | 'professional' | 'enterprise'
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

export interface SubscriptionRequest {
  email: string
  price_id: string
  plan: 'starter' | 'professional' | 'enterprise'
}

export interface SubscriptionResponse {
  subscriptionId: string
  clientSecret: string
  customerId: string
}

// ========== VALIDATION SCHEMAS ==========

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .transform(sanitizeInput.text),
  email: z
    .string()
    .email('Adresse email invalide')
    .transform(sanitizeInput.email),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères')
    .transform(sanitizeInput.text),
  phone: z
    .string()
    .optional()
    .transform(val => (val ? sanitizeInput.phone(val) : val)),
  company: z
    .string()
    .optional()
    .transform(val => (val ? sanitizeInput.company(val) : val)),
})

const demoFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .transform(sanitizeInput.text),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .transform(sanitizeInput.text),
  email: z
    .string()
    .email('Adresse email invalide')
    .transform(sanitizeInput.email),
  phone: z
    .string()
    .optional()
    .transform(val => (val ? sanitizeInput.phone(val) : val)),
  company: z
    .string()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères")
    .max(100, "Le nom de l'entreprise ne peut pas dépasser 100 caractères")
    .transform(sanitizeInput.company),
  employees: z
    .string()
    .optional()
    .transform(val => (val ? sanitizeInput.text(val) : val)),
  needs: z
    .string()
    .optional()
    .transform(val => (val ? sanitizeInput.text(val) : val)),
})

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z
          .string()
          .min(1, 'Le contenu du message ne peut pas être vide')
          .max(10000, 'Le message ne peut pas dépasser 10000 caractères')
          .refine(
            contentSecurity.validatePrompt,
            'Contenu du message invalide'
          ),
      })
    )
    .min(1, 'Au moins un message est requis'),
  sessionId: z
    .string()
    .min(1, "L'ID de session est requis")
    .refine(
      val => contentSecurity.validateSessionId(val),
      "Format d'ID de session invalide"
    ),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
})

// ========== UTILITY FUNCTIONS ==========

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const isNetworkError = (error: any): boolean => {
  return error.name === 'TypeError' && error.message.includes('fetch')
}

const isRetryableError = (error: any): boolean => {
  if (isNetworkError(error)) return true
  if (error instanceof ApiError) {
    return [408, 429, 500, 502, 503, 504].includes(error.statusCode)
  }
  return false
}

// ========== CACHE INTEGRATION ==========

// Use the smart cache from performance utils
const apiCache = {
  get: (key: string) => smartCache.get(key),
  set: (key: string, data: any) =>
    smartCache.set(key, data, API_CONFIG.cacheTTL),
  clear: () => smartCache.clear(),
}

// ========== HTTP CLIENT ==========

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit,
  retriesLeft: number = API_CONFIG.retries
): Promise<T> {
  const baseUrl = getFunctionsBaseUrl()
  const url = `${baseUrl}${endpoint}`
  const method = options.method || 'GET'
  const cacheKey = `${method}:${url}:${JSON.stringify(options.body || {})}`

  // Check cache for GET requests
  if (method === 'GET') {
    const cachedData = apiCache.get(cacheKey)
    if (cachedData !== null) {
      performanceMonitor.recordApiCall({
        endpoint,
        method,
        duration: 0,
        statusCode: 200,
        success: true,
        cached: true,
        retryCount: API_CONFIG.retries - retriesLeft,
      })
      return cachedData as T
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

  const startTime = performance.now()

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)
    const duration = performance.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      const apiError = new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorText
      )

      performanceMonitor.recordApiCall({
        endpoint,
        method,
        duration,
        statusCode: response.status,
        success: false,
        cached: false,
        retryCount: API_CONFIG.retries - retriesLeft,
        errorType: 'http_error',
      })

      throw apiError
    }

    const data = await response.json()

    // Cache successful GET responses
    if (method === 'GET' && response.ok) {
      apiCache.set(cacheKey, data)
    }

    // Add metadata to response
    if (typeof data === 'object' && data !== null) {
      data.metadata = {
        ...data.metadata,
        duration,
        timestamp: new Date().toISOString(),
      }
    }

    performanceMonitor.recordApiCall({
      endpoint,
      method,
      duration,
      statusCode: response.status,
      success: true,
      cached: false,
      retryCount: API_CONFIG.retries - retriesLeft,
    })

    return data
  } catch (error) {
    clearTimeout(timeoutId)
    const duration = performance.now() - startTime

    if (isRetryableError(error) && retriesLeft > 0) {
      const backoffDelay =
        API_CONFIG.retryDelay * (API_CONFIG.retries - retriesLeft + 1)
      await delay(backoffDelay)

      performanceMonitor.recordApiCall({
        endpoint,
        method,
        duration,
        statusCode: 0,
        success: false,
        cached: false,
        retryCount: API_CONFIG.retries - retriesLeft,
        errorType: 'retry',
      })

      return apiRequest<T>(endpoint, options, retriesLeft - 1)
    }

    performanceMonitor.recordApiCall({
      endpoint,
      method,
      duration,
      statusCode: 0,
      success: false,
      cached: false,
      retryCount: API_CONFIG.retries - retriesLeft,
      errorType: error instanceof ApiError ? 'api_error' : 'network_error',
    })

    if (error instanceof ApiError) {
      throw error
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408)
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0
    )
  }
}

// ========== VALIDATION HELPERS ==========

function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw new ApiError(`Validation error: ${errorMessages.join(', ')}`, 400)
    }
    throw error
  }
}

// ========== API CLIENTS ==========

export const contactAPI = {
  async submitContactForm(data: ContactFormData): Promise<ApiResponse> {
    // Check rate limiting (use a simple key for demo - in production, use user IP or session)
    const rateLimitKey = `contact_${Date.now()}`
    if (rateLimiters.contact.isRateLimited(rateLimitKey)) {
      return {
        success: false,
        message: 'Trop de demandes. Veuillez réessayer dans une minute.',
        errors: ['Rate limit exceeded'],
      }
    }

    const validatedData = validateAndSanitize(contactFormSchema, data)

    try {
      const response = await apiRequest<ApiResponse>('/ContactForm', {
        method: 'POST',
        body: JSON.stringify(validatedData),
      })

      return response
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof ApiError
            ? error.message
            : 'Contact form submission failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  },
}

export const demoAPI = {
  async submitDemoForm(data: DemoFormData): Promise<ApiResponse> {
    // Check rate limiting
    const rateLimitKey = `demo_${Date.now()}`
    if (rateLimiters.demo.isRateLimited(rateLimitKey)) {
      return {
        success: false,
        message: 'Trop de demandes. Veuillez réessayer dans une minute.',
        errors: ['Rate limit exceeded'],
      }
    }

    const validatedData = validateAndSanitize(demoFormSchema, data)

    try {
      const response = await apiRequest<ApiResponse>('/DemoForm', {
        method: 'POST',
        body: JSON.stringify(validatedData),
      })

      return response
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof ApiError
            ? error.message
            : 'Demo form submission failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  },
}

export const paymentAPI = {
  async createPaymentIntent(
    request: PaymentIntentRequest
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    try {
      const response = await apiRequest<ApiResponse<PaymentIntentResponse>>(
        '/create-payment-intent',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      )

      return response
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof ApiError
            ? error.message
            : 'Payment intent creation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  },

  async createSubscription(
    request: SubscriptionRequest
  ): Promise<ApiResponse<SubscriptionResponse>> {
    try {
      const response = await apiRequest<ApiResponse<SubscriptionResponse>>(
        '/create-subscription',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      )

      return response
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof ApiError
            ? error.message
            : 'Subscription creation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  },
}

export const chatAPI = {
  async sendMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    // Check rate limiting
    const rateLimitKey = `chat_${request.sessionId}`
    if (rateLimiters.chat.isRateLimited(rateLimitKey)) {
      return {
        success: false,
        message:
          'Trop de demandes de chat. Veuillez patienter avant de continuer.',
        errors: ['Rate limit exceeded'],
      }
    }

    const validatedRequest = validateAndSanitize(chatRequestSchema, request)

    try {
      const response = await apiRequest<ApiResponse<ChatResponse>>('/chat', {
        method: 'POST',
        body: JSON.stringify({
          ...validatedRequest,
          temperature: validatedRequest.temperature || 0.7,
          maxTokens: validatedRequest.maxTokens || 1000,
        }),
      })

      return response
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof ApiError ? error.message : 'Chat request failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  },

  // Convenience method for simple prompts
  async sendSimpleMessage(
    prompt: string,
    sessionId: string
  ): Promise<ApiResponse<ChatResponse>> {
    return this.sendMessage({
      messages: [
        {
          role: 'system',
          content:
            "Vous êtes WorkFlowAI, un assistant IA spécialisé en automatisation d'entreprise pour les PME françaises. Répondez en français avec des conseils pratiques.",
        },
        { role: 'user', content: prompt },
      ],
      sessionId,
    })
  },
}

export const visionAPI = {
  async processDocument(
    request: VisionRequest
  ): Promise<ApiResponse<VisionResponse>> {
    if (!request.imageData) {
      return {
        success: false,
        message: 'No image data provided',
        errors: ['imageData is required'],
      }
    }

    // Check rate limiting
    const rateLimitKey = `vision_${Date.now()}`
    if (rateLimiters.vision.isRateLimited(rateLimitKey)) {
      return {
        success: false,
        message:
          "Trop de demandes de traitement d'image. Veuillez réessayer dans une minute.",
        errors: ['Rate limit exceeded'],
      }
    }

    // Validate image data
    if (!contentSecurity.validateImageData(request.imageData)) {
      return {
        success: false,
        message: "Format d'image invalide ou taille excessive",
        errors: ['Invalid image format or size too large'],
      }
    }

    try {
      const response = await apiRequest<ApiResponse<VisionResponse>>(
        '/vision',
        {
          method: 'POST',
          body: JSON.stringify({
            imageData: request.imageData,
            analyzeText: request.analyzeText ?? true,
          }),
        }
      )

      return response
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof ApiError
            ? error.message
            : 'Document processing failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  },
}

// ========== HEALTH CHECK ==========

export const healthAPI = {
  async checkHealth(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    try {
      const response = await apiRequest<{
        status: string
        uptime: number
        timestamp: string
      }>('/health', {
        method: 'GET',
      })

      // Transform backend response to match expected frontend structure
      return {
        success: true,
        data: {
          status: response.status,
          timestamp: response.timestamp,
        },
        metadata: {
          duration: 0,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      return {
        success: false,
        message: 'Health check failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          duration: 0,
          timestamp: new Date().toISOString(),
        },
      }
    }
  },
}

// ========== UTILITIES ==========

export const apiUtils = {
  clearCache: () => apiCache.clear(),
  setCacheEnabled: (enabled: boolean) => {
    ;(API_CONFIG as any).cacheEnabled = enabled
    if (!enabled) apiCache.clear()
  },
  getCacheStats: () => ({
    size: apiCache.cache?.size || 0,
    enabled: API_CONFIG.cacheEnabled,
  }),
}

// Export types for external use
export type { ApiError }
