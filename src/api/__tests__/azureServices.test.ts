import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  contactAPI,
  demoAPI,
  chatAPI,
  visionAPI,
  healthAPI,
  apiUtils,
  type ContactFormData,
  type DemoFormData,
  type ChatRequest,
  type ApiResponse,
} from '../azureServices'

// Mock fetch globally
const fetchMock = vi.fn()
global.fetch = fetchMock

// Mock performance monitoring
vi.mock('@/utils/performance', () => ({
  performanceMonitor: {
    recordApiCall: vi.fn(),
  },
  smartCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
}))

// Mock security utilities
vi.mock('@/utils/security', () => ({
  sanitizeInput: {
    text: vi.fn(input => input),
    email: vi.fn(input => input),
    phone: vi.fn(input => input),
    company: vi.fn(input => input),
  },
  rateLimiters: {
    contact: { isRateLimited: vi.fn(() => false) },
    demo: { isRateLimited: vi.fn(() => false) },
    chat: { isRateLimited: vi.fn(() => false) },
    vision: { isRateLimited: vi.fn(() => false) },
  },
  contentSecurity: {
    validatePrompt: vi.fn(() => true),
    validateSessionId: vi.fn(() => true),
    validateImageData: vi.fn(() => true),
  },
}))

// Mock configuration
vi.mock('@/utils/config', () => ({
  config: {
    functionsBaseUrl: 'https://test-api.com/api',
    client: {
      VITE_ENABLE_CACHE: true,
    },
  },
}))

describe('Azure Services API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Contact API', () => {
    const validContactData: ContactFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
      phone: '+33123456789',
      company: 'Test Company',
    }

    it('should submit contact form successfully', async () => {
      const mockResponse: ApiResponse = {
        success: true,
        message: 'Contact form submitted successfully',
        data: { messageId: '123' },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await contactAPI.submitContactForm(validContactData)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://test-api.com/api/ContactForm',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validContactData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle contact form validation errors', async () => {
      const invalidData = {
        name: '', // Invalid: too short
        email: 'invalid-email', // Invalid: not an email
        message: 'Hi', // Invalid: too short
      }

      const result = await contactAPI.submitContactForm(invalidData as any)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors!.length).toBeGreaterThan(0)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('should handle rate limiting', async () => {
      const { rateLimiters } = await import('@/utils/security')
      vi.mocked(rateLimiters.contact.isRateLimited).mockReturnValue(true)

      const result = await contactAPI.submitContactForm(validContactData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Trop de demandes')
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('should handle network errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const result = await contactAPI.submitContactForm(validContactData)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Network error')
    })

    it('should handle HTTP errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      })

      const result = await contactAPI.submitContactForm(validContactData)

      expect(result.success).toBe(false)
      expect(result.message).toContain('HTTP 500')
    })
  })

  describe('Demo API', () => {
    const validDemoData: DemoFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company: 'Test Company',
      phone: '+33123456789',
      employees: '10-50',
      needs: 'Automation solutions',
    }

    it('should submit demo form successfully', async () => {
      const mockResponse: ApiResponse = {
        success: true,
        message: 'Demo request submitted successfully',
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await demoAPI.submitDemoForm(validDemoData)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://test-api.com/api/DemoForm',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(validDemoData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle demo form validation errors', async () => {
      const invalidData = {
        firstName: '',
        lastName: '',
        email: 'not-an-email',
        company: '',
      }

      const result = await demoAPI.submitDemoForm(invalidData as any)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('Chat API', () => {
    const validChatRequest: ChatRequest = {
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant',
        },
        {
          role: 'user',
          content: 'Hello!',
        },
      ],
      sessionId: 'session-123',
    }

    it('should send chat message successfully', async () => {
      const mockResponse: ApiResponse<{ message: string; usage: any }> = {
        success: true,
        data: {
          message: 'Hello! How can I help you?',
          usage: { totalTokens: 150 },
        },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await chatAPI.sendMessage(validChatRequest)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://test-api.com/api/chat',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"sessionId":"session-123"'),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should use sendSimpleMessage convenience method', async () => {
      const mockResponse: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Response from AI' },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await chatAPI.sendSimpleMessage('Hello', 'session-123')

      expect(result.success).toBe(true)
      expect(fetchMock).toHaveBeenCalled()
    })

    it('should validate chat messages', async () => {
      const invalidRequest = {
        messages: [],
        sessionId: 'invalid-session-id-format-that-is-way-too-long',
      }

      const result = await chatAPI.sendMessage(invalidRequest as any)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('should handle prompt security validation', async () => {
      const { contentSecurity } = await import('@/utils/security')
      vi.mocked(contentSecurity.validatePrompt).mockReturnValue(false)

      const result = await chatAPI.sendMessage(validChatRequest)

      expect(result.success).toBe(false)
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('Vision API', () => {
    const validVisionRequest = {
      imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
      analyzeText: true,
    }

    it('should process document successfully', async () => {
      const mockResponse: ApiResponse<{ data: any }> = {
        success: true,
        data: { text: 'Extracted text from image' },
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await visionAPI.processDocument(validVisionRequest)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://test-api.com/api/vision',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(validVisionRequest),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should reject invalid image data', async () => {
      const { contentSecurity } = await import('@/utils/security')
      vi.mocked(contentSecurity.validateImageData).mockReturnValue(false)

      const result = await visionAPI.processDocument(validVisionRequest)

      expect(result.success).toBe(false)
      expect(result.message).toContain("Format d'image invalide")
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('should reject missing image data', async () => {
      const result = await visionAPI.processDocument({ imageData: '' })

      expect(result.success).toBe(false)
      expect(result.errors).toContain('imageData is required')
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('Health API', () => {
    it('should check health successfully', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ status: 'healthy' }),
      })

      const result = await healthAPI.checkHealth()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
      })
    })

    it('should handle health check failure', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Connection failed'))

      const result = await healthAPI.checkHealth()

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Connection failed')
    })
  })

  describe('API Utilities', () => {
    it('should clear cache', async () => {
      const { smartCache } = await import('@/utils/performance')

      apiUtils.clearCache()

      expect(smartCache.clear).toHaveBeenCalled()
    })

    it('should get cache stats', async () => {
      const { smartCache } = await import('@/utils/performance')
      vi.mocked(smartCache.getStats).mockReturnValue({
        size: 10,
        hitRate: 85,
        totalAccesses: 100,
        oldestEntry: Date.now() - 60000,
        newestEntry: Date.now(),
      })

      const stats = apiUtils.getCacheStats()

      expect(stats.size).toBe(10)
      expect(stats.hitRate).toBe(85)
    })
  })

  describe('Error Handling and Retries', () => {
    it('should retry on network errors', async () => {
      fetchMock
        .mockRejectedValueOnce(new TypeError('Network error')) // Retryable
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        })

      const result = await contactAPI.submitContactForm(validContactData)

      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(result.success).toBe(true)
    })

    it('should retry on server errors', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: () => Promise.resolve('Server error'),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        })

      const result = await contactAPI.submitContactForm(validContactData)

      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(result.success).toBe(true)
    })

    it('should not retry on client errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Bad request'),
      })

      const result = await contactAPI.submitContactForm(validContactData)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(false)
    })
  })

  describe('Caching', () => {
    it('should use cached data for GET requests', async () => {
      const { smartCache } = await import('@/utils/performance')
      const cachedData = { success: true, data: 'cached' }
      vi.mocked(smartCache.get).mockReturnValue(cachedData)

      // Mock health API which uses GET
      const result = await healthAPI.checkHealth()

      expect(smartCache.get).toHaveBeenCalled()
      expect(result).toEqual(cachedData)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('should cache successful GET responses', async () => {
      const { smartCache } = await import('@/utils/performance')
      vi.mocked(smartCache.get).mockReturnValue(null)

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      })

      await healthAPI.checkHealth()

      expect(smartCache.set).toHaveBeenCalled()
    })
  })
})
