import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  apiUtils,
  chatAPI,
  contactAPI,
  demoAPI,
  healthAPI,
  visionAPI,
  type ApiResponse,
  type ChatRequest,
  type ContactFormData,
  type DemoFormData,
} from '../azureServices'

// Mock fetch globally
const fetchMock = vi.fn()
global.fetch = fetchMock

// Mock AbortController for timeout handling
global.AbortController = vi.fn().mockImplementation(() => ({
  signal: { aborted: false },
  abort: vi.fn(),
}))

// Mock performance monitoring
vi.mock('@/utils/performance', () => ({
  performanceMonitor: {
    recordApiCall: vi.fn(),
  },
  smartCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn(() => ({
      size: 10,
      hitRate: 85,
      enabled: true,
      maxSize: 100,
      totalSize: 50,
      utilizationPercent: 20,
    })),
    cache: { size: 10 },
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
    apiBaseUrl: 'https://test-api.com',
    functionsBaseUrl: 'https://test-api.com',
    client: {
      VITE_ENABLE_CACHE: true,
      VITE_FEATURE_ENABLE_CACHE: true,
      VITE_CACHE_DEFAULT_TTL: 300000,
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
        'https://test-api.com/contactform',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validContactData),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle contact form validation errors', async () => {
      const validContactData: ContactFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        phone: '+33123456789',
        company: 'Test Company',
      }

      const mockResponse: ApiResponse = {
        success: false,
        message: 'Validation error',
        errors: ['Email requis', 'Message trop court'],
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await contactAPI.submitContactForm(validContactData)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
      expect(fetchMock).toHaveBeenCalled()
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
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringMatching(/Network error:/)])
      )
    })

    it('should handle HTTP errors', async () => {
      // Mock a response that will cause an error in the apiRequest function
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      })

      const result = await contactAPI.submitContactForm(validContactData)

      expect(result.success).toBe(false)
      expect(result.message).toBeDefined()
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
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
        'https://test-api.com/demoform',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining(validDemoData.firstName),
          signal: undefined,
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle demo form validation errors', async () => {
      const validDemoData: DemoFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Test Company',
        phone: '+33123456789',
        employees: '10-50',
        needs: 'Automation solutions',
      }

      const mockResponse: ApiResponse = {
        success: false,
        message: 'Validation error',
        errors: ['Email requis', 'Company trop court'],
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await demoAPI.submitDemoForm(validDemoData)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(fetchMock).toHaveBeenCalled()
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
      const mockResponse: ApiResponse<{
        message: string
        usage: { totalTokens: number }
      }> = {
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
        expect.stringContaining('/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

      const mockResponse: ApiResponse = {
        success: false,
        message: 'Validation error',
        errors: ['Messages requis', 'Session ID invalide'],
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await chatAPI.sendMessage(validChatRequest)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(fetchMock).toHaveBeenCalled()
    })

    it('should handle prompt security validation', async () => {
      const { contentSecurity } = await import('@/utils/security')
      vi.mocked(contentSecurity.validatePrompt).mockReturnValue(false)

      await expect(chatAPI.sendMessage(validChatRequest)).rejects.toThrow(
        'Validation error: messages.0.content: Contenu du message invalide'
      )
    })
  })

  describe('Vision API', () => {
    const validVisionRequest = {
      imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
      analyzeText: true,
    }

    it('should process document successfully', async () => {
      const mockResponse: ApiResponse<{ text: string }> = {
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
        'https://test-api.com/vision',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      const { smartCache } = await import('@/utils/performance')
      // Ensure no cached data for this test
      vi.mocked(smartCache.get).mockReturnValue(null)

      // Mock a successful health response from backend
      const mockBackendResponse = {
        status: 'healthy',
        uptime: 123.45,
        timestamp: '2024-01-15T10:30:00Z',
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBackendResponse),
      })

      const result = await healthAPI.checkHealth()

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00Z',
      })
    })

    it('should handle health check failure', async () => {
      // Ensure no cached data for this test
      const { smartCache } = await import('@/utils/performance')
      vi.mocked(smartCache.get).mockReturnValue(null)

      // Mock a network error
      fetchMock.mockRejectedValueOnce(new Error('Connection failed'))

      const result = await healthAPI.checkHealth()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Health check failed')
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Network error:.*Connection failed/),
        ])
      )
    })
  })

  describe('API Utilities', () => {
    it('should clear cache', async () => {
      apiUtils.clearCache()

      const { smartCache } = await import('@/utils/performance')
      expect(smartCache.clear).toHaveBeenCalled()
    })

    it('should get cache stats', async () => {
      const stats = apiUtils.getCacheStats()

      expect(stats).toEqual(
        expect.objectContaining({
          size: 10,
          hitRate: 85,
          enabled: true,
          maxSize: expect.any(Number),
          totalSize: expect.any(Number),
          utilizationPercent: expect.any(Number),
        })
      )
    })
  })

  describe('Error Handling and Retries', () => {
    const validContactData: ContactFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
      phone: '+33123456789',
      company: 'Test Company',
    }

    it('should retry on network errors', async () => {
      fetchMock
        .mockRejectedValueOnce(new TypeError('fetch')) // Network error - retryable
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
      // Cache should store the raw backend response
      const cachedBackendResponse = {
        status: 'healthy',
        uptime: 123.45,
        timestamp: '2024-01-15T10:30:00Z',
      }
      vi.mocked(smartCache.get).mockReturnValue(cachedBackendResponse)

      // Mock health API which uses GET
      const result = await healthAPI.checkHealth()

      expect(smartCache.get).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data.status).toBe('healthy')
      expect(result.data.timestamp).toBe('2024-01-15T10:30:00Z')
      expect(result.metadata).toBeDefined()
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
