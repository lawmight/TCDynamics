import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  contentSecurity,
  rateLimiters,
  sanitizeInput,
  securityHeaders,
  securityUtils,
} from '../security'

// Mock DOMPurify
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: vi.fn(input => input),
  },
}))

describe('Security Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Input Sanitization', () => {
    describe('sanitizeInput.text', () => {
      it('should remove angle brackets', () => {
        const input = '<script>alert("xss")</script>Hello World'
        const result = sanitizeInput.text(input)
        expect(result).toBe('scriptalert("xss")/scriptHello World')
      })

      it('should remove javascript protocol', () => {
        const input = 'javascript:alert("xss")'
        const result = sanitizeInput.text(input)
        expect(result).toBe('alert("xss")')
      })

      it('should trim whitespace', () => {
        const input = '  hello world  '
        const result = sanitizeInput.text(input)
        expect(result).toBe('hello world')
      })

      it('should handle normal text', () => {
        const input = 'Hello World'
        const result = sanitizeInput.text(input)
        expect(result).toBe('Hello World')
      })
    })

    describe('sanitizeInput.email', () => {
      it('should convert to lowercase', () => {
        const input = 'John.DOE@Example.COM'
        const result = sanitizeInput.email(input)
        expect(result).toBe('john.doe@example.com')
      })

      it('should trim whitespace', () => {
        const input = '  john@example.com  '
        const result = sanitizeInput.email(input)
        expect(result).toBe('john@example.com')
      })
    })

    describe('sanitizeInput.phone', () => {
      it('should keep valid phone characters', () => {
        const input = '+33 1 23 45 67 89'
        const result = sanitizeInput.phone(input)
        expect(result).toBe('+33 1 23 45 67 89')
      })

      it('should remove invalid characters', () => {
        const input = 'abc+33-def@#$%'
        const result = sanitizeInput.phone(input)
        expect(result).toBe('+33-')
      })
    })

    describe('sanitizeInput.filename', () => {
      it('should replace unsafe characters', () => {
        const input = 'file<name>.jpg'
        const result = sanitizeInput.filename(input)
        expect(result).toBe('file_name_.jpg')
      })

      it('should limit length', () => {
        const input = 'a'.repeat(300)
        const result = sanitizeInput.filename(input)
        expect(result.length).toBeLessThanOrEqual(255)
      })
    })
  })

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Reset rate limiter state
      vi.useFakeTimers()

      // Clear rate limiter state between tests
      const limiter = rateLimiters.contact as any
      if (limiter && limiter.limits) {
        limiter.limits.clear()
      }
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should allow requests within limit', () => {
      const limiter = rateLimiters.contact
      const key = 'test-user'

      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        expect(limiter.isRateLimited(key)).toBe(false)
      }
    })

    it('should block requests over limit', () => {
      const limiter = rateLimiters.contact
      const key = 'test-user'

      // Use up all requests
      for (let i = 0; i < 5; i++) {
        limiter.isRateLimited(key)
      }

      // Next request should be blocked
      expect(limiter.isRateLimited(key)).toBe(true)
    })

    it('should reset after window expires', () => {
      const limiter = rateLimiters.contact
      const key = 'test-user'

      // Use up all requests (5 allowed, 6th should be blocked)
      for (let i = 0; i < 6; i++) {
        const result = limiter.isRateLimited(key)
        if (i < 5) {
          expect(result).toBe(false) // First 5 should be allowed
        } else {
          expect(result).toBe(true) // 6th should be blocked
        }
      }

      // Advance time by more than 1 minute to ensure reset
      vi.advanceTimersByTime(65000)

      // Should allow requests again
      expect(limiter.isRateLimited(key)).toBe(false)
    })

    it('should track remaining requests', () => {
      const limiter = rateLimiters.contact
      const key = 'test-user'

      // Initially should have all requests available (no entry exists yet)
      expect(limiter.getRemainingRequests(key)).toBe(5)

      // First request should be allowed and consume 1 request
      const firstRequest = limiter.isRateLimited(key)
      expect(firstRequest).toBe(false)
      expect(limiter.getRemainingRequests(key)).toBe(4)

      // Second request should be allowed and consume another request
      const secondRequest = limiter.isRateLimited(key)
      expect(secondRequest).toBe(false)
      expect(limiter.getRemainingRequests(key)).toBe(3)
    })
  })

  describe('Content Security', () => {
    describe('validateImageData', () => {
      it('should accept valid data URL', () => {
        const validDataUrl =
          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD'
        const result = contentSecurity.validateImageData(validDataUrl)
        expect(result).toBe(true)
      })

      it('should reject invalid data URL', () => {
        const invalidDataUrl = 'not-a-data-url'
        const result = contentSecurity.validateImageData(invalidDataUrl)
        expect(result).toBe(false)
      })

      it('should reject unsupported image types', () => {
        const unsupportedType = 'data:image/bmp;base64,abc'
        const result = contentSecurity.validateImageData(unsupportedType)
        expect(result).toBe(false)
      })

      it('should reject oversized images', () => {
        const largeDataUrl = `data:image/jpeg;base64,${'a'.repeat(10 * 1024 * 1024)}` // 10MB
        const result = contentSecurity.validateImageData(largeDataUrl, 5) // 5MB limit
        expect(result).toBe(false)
      })
    })

    describe('validatePrompt', () => {
      it('should accept safe prompts', () => {
        const safePrompt = 'Hello, how can I help you with automation?'
        const result = contentSecurity.validatePrompt(safePrompt)
        expect(result).toBe(true)
      })

      it('should reject script tags', () => {
        const maliciousPrompt = '<script>alert("xss")</script>Hello'
        const result = contentSecurity.validatePrompt(maliciousPrompt)
        expect(result).toBe(false)
      })

      it('should reject javascript protocol', () => {
        const maliciousPrompt = 'javascript:alert("xss")'
        const result = contentSecurity.validatePrompt(maliciousPrompt)
        expect(result).toBe(false)
      })

      it('should reject event handlers', () => {
        const maliciousPrompt =
          'Click here: <a onclick="alert(\'xss\')">link</a>'
        const result = contentSecurity.validatePrompt(maliciousPrompt)
        expect(result).toBe(false)
      })

      it('should enforce length limits', () => {
        const longPrompt = 'a'.repeat(10001)
        const result = contentSecurity.validatePrompt(longPrompt)
        expect(result).toBe(false)
      })
    })

    describe('validateSessionId', () => {
      it('should accept valid session IDs', () => {
        const validSessionId = 'abc123def456ghi789jkl012mno345pqr678'
        const result = contentSecurity.validateSessionId(validSessionId)
        expect(result).toBe(true)
      })

      it('should reject invalid session IDs', () => {
        const invalidSessionId = 'invalid-session-id'
        const result = contentSecurity.validateSessionId(invalidSessionId)
        expect(result).toBe(false)
      })

      it('should reject too short session IDs', () => {
        const shortSessionId = 'abc123'
        const result = contentSecurity.validateSessionId(shortSessionId)
        expect(result).toBe(false)
      })

      it('should reject too long session IDs', () => {
        const longSessionId = 'a'.repeat(129)
        const result = contentSecurity.validateSessionId(longSessionId)
        expect(result).toBe(false)
      })
    })
  })

  describe('Security Headers', () => {
    it('should return security headers', () => {
      const headers = securityHeaders.getSecurityHeaders()

      expect(headers).toHaveProperty('X-Content-Type-Options', 'nosniff')
      expect(headers).toHaveProperty('X-Frame-Options', 'DENY')
      expect(headers).toHaveProperty('X-XSS-Protection', '1; mode=block')
      expect(headers).toHaveProperty(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      )
      expect(headers).toHaveProperty(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      )
      expect(headers).toHaveProperty('Content-Security-Policy')
    })

    describe('testCSP', () => {
      it('should validate standard CSP correctly', () => {
        const csp = securityHeaders.getStandardCSP()
        const result = securityHeaders.testCSP(csp)

        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
        expect(result.warnings).toBeDefined() // May have warnings about unsafe directives
      })

      it('should validate strict CSP correctly', () => {
        const csp = securityHeaders.getStrictCSP()
        const result = securityHeaders.testCSP(csp)

        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
        expect(result.warnings).toBeDefined()
      })

      it('should detect missing critical directives', () => {
        const invalidCsp = "default-src 'self'; script-src 'self';"
        const result = securityHeaders.testCSP(invalidCsp)

        expect(result.valid).toBe(false)
        expect(result.errors).toContain(
          'Missing base-uri directive - base tag injection attacks possible'
        )
        expect(result.errors).toContain(
          'Missing form-action directive - form action hijacking possible'
        )
        expect(result.errors).toContain(
          'Missing frame-ancestors directive - clickjacking protection limited'
        )
      })

      it('should handle CSP strings without critical directives', () => {
        const incompleteCsp =
          "default-src 'self'; script-src 'self'; style-src 'self';"
        const result = securityHeaders.testCSP(incompleteCsp)

        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(
          result.errors.some(
            error =>
              error.includes('Missing base-uri directive') ||
              error.includes('Missing form-action directive') ||
              error.includes('Missing frame-ancestors directive')
          )
        ).toBe(true)
      })
    })

    describe('isAllowedOrigin', () => {
      it('should accept allowed origins', () => {
        const allowedOrigins = [
          'https://tcdynamics.fr',
          'https://www.tcdynamics.fr',
          'http://localhost:8080',
          'http://localhost:8080',
        ]

        allowedOrigins.forEach(origin => {
          const result = securityHeaders.isAllowedOrigin(origin)
          expect(result).toBe(true)
        })
      })

      it('should reject disallowed origins', () => {
        const disallowedOrigins = [
          'https://evil.com',
          'http://malicious-site.com',
          null,
          '',
        ]

        disallowedOrigins.forEach(origin => {
          const result = securityHeaders.isAllowedOrigin(origin)
          expect(result).toBe(false)
        })
      })

      it('should handle invalid URLs', () => {
        const invalidOrigin = 'not-a-valid-url'
        const result = securityHeaders.isAllowedOrigin(invalidOrigin)
        expect(result).toBe(false)
      })
    })
  })

  describe('Security Utilities', () => {
    describe('generateSecureId', () => {
      it('should generate IDs of correct length', () => {
        const id = securityUtils.generateSecureId(32)
        expect(id).toHaveLength(64) // Hex encoding doubles the length
        expect(id).toMatch(/^[a-f0-9]+$/)
      })

      it('should generate unique IDs', () => {
        const id1 = securityUtils.generateSecureId()
        const id2 = securityUtils.generateSecureId()
        expect(id1).not.toBe(id2)
      })
    })

    describe('hashString', () => {
      it('should hash strings consistently', async () => {
        const input = 'test string'
        const hash1 = await securityUtils.hashString(input)
        const hash2 = await securityUtils.hashString(input)

        expect(hash1).toBe(hash2)
        expect(hash1).toMatch(/^[a-f0-9]+$/)
        expect(hash1).toHaveLength(64) // SHA-256 produces 64 hex characters
      })

      it('should produce different hashes for different inputs', async () => {
        const hash1 = await securityUtils.hashString('input1')
        const hash2 = await securityUtils.hashString('input2')

        expect(hash1).not.toBe(hash2)
      })
    })

    describe('isDevelopment', () => {
      it('should detect development environment', () => {
        // This depends on the actual environment, so we'll just test that it returns a boolean
        const result = securityUtils.isDevelopment()
        expect(typeof result).toBe('boolean')
      })
    })

    describe('logSecurityEvent', () => {
      const originalConsoleWarn = console.warn
      let consoleWarnMock: vi.MockedFunction<typeof console.warn>

      beforeEach(() => {
        consoleWarnMock = vi.fn()
        console.warn = consoleWarnMock
      })

      afterEach(() => {
        console.warn = originalConsoleWarn
      })

      it('should log security events with timestamp', () => {
        const event = 'suspicious_activity'
        const details = { ip: '192.168.1.1', action: 'login_attempt' }

        securityUtils.logSecurityEvent(event, details)

        expect(consoleWarnMock).toHaveBeenCalledWith(
          expect.stringContaining('WARN: Security event:'),
          { details }
        )
      })
    })
  })
})
