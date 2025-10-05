// src/utils/security.ts
// Security utilities for input sanitization, validation, and protection

import DOMPurify from 'isomorphic-dompurify'
import { logger } from './logger'

// ========== INPUT SANITIZATION ==========

export const sanitizeInput = {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  html: (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
    })
  },

  /**
   * Sanitize text input by removing potentially dangerous characters
   */
  text: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .trim()
  },

  /**
   * Sanitize email addresses
   */
  email: (email: string): string => {
    return email.toLowerCase().trim()
  },

  /**
   * Sanitize phone numbers (remove non-numeric characters except +)
   */
  phone: (phone: string): string => {
    return phone.replace(/[^+\d\s\-()]/g, '').trim()
  },

  /**
   * Sanitize company names
   */
  company: (company: string): string => {
    return sanitizeInput.text(company)
  },

  /**
   * Sanitize file names
   */
  filename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .substring(0, 255) // Limit length
  },
}

// ========== RATE LIMITING ==========

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor(
    private windowMs: number = 60000, // 1 minute
    private maxRequests: number = 10
  ) {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000)
  }

  isRateLimited(key: string): boolean {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return false
    }

    if (entry.count >= this.maxRequests) {
      return true // Rate limited
    }

    entry.count++
    return false
  }

  getRemainingRequests(key: string): number {
    const entry = this.limits.get(key)
    if (!entry) return this.maxRequests
    return Math.max(0, this.maxRequests - entry.count)
  }

  getResetTime(key: string): number {
    const entry = this.limits.get(key)
    return entry?.resetTime || 0
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.limits.clear()
  }
}

// Create rate limiters for different endpoints
export const rateLimiters = {
  contact: new RateLimiter(60000, 5), // 5 requests per minute for contact forms
  demo: new RateLimiter(60000, 3), // 3 requests per minute for demo requests
  chat: new RateLimiter(60000, 20), // 20 requests per minute for chat
  vision: new RateLimiter(60000, 10), // 10 requests per minute for vision
}

// ========== CONTENT SECURITY ==========

export const contentSecurity = {
  /**
   * Validate image data URL format and size
   */
  validateImageData: (dataUrl: string, maxSizeMB: number = 10): boolean => {
    try {
      // Check if it's a valid data URL
      if (!dataUrl.startsWith('data:image/')) {
        return false
      }

      // Extract MIME type
      const mimeMatch = dataUrl.match(/^data:image\/([a-zA-Z]+);base64,/)
      if (!mimeMatch) {
        return false
      }

      const mimeType = mimeMatch[1]
      if (
        !['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(mimeType.toLowerCase())
      ) {
        return false
      }

      // Check file size
      const base64Data = dataUrl.split(',')[1]
      if (!base64Data) return false

      // Rough estimation: base64 is ~33% larger than binary
      const fileSizeBytes = (base64Data.length * 3) / 4
      const maxSizeBytes = maxSizeMB * 1024 * 1024

      return fileSizeBytes <= maxSizeBytes
    } catch {
      return false
    }
  },

  /**
   * Validate prompt content for AI requests
   */
  validatePrompt: (prompt: string, maxLength: number = 10000): boolean => {
    if (!prompt || typeof prompt !== 'string') {
      return false
    }

    if (prompt.length > maxLength) {
      return false
    }

    // Check for potentially harmful content patterns
    const harmfulPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick, onload, etc.
      /data:\s*text\/html/gi,
    ]

    return !harmfulPatterns.some(pattern => pattern.test(prompt))
  },

  /**
   * Validate session ID format
   */
  validateSessionId: (sessionId: string): boolean => {
    // Session ID should be alphanumeric with hyphens, 32-128 characters
    const sessionIdRegex = /^[a-zA-Z0-9-]{32,128}$/
    return sessionIdRegex.test(sessionId)
  },
}

// ========== CORS AND HEADERS ==========

export const securityHeaders = {
  /**
   * Get security headers for API responses
   */
  getSecurityHeaders: (config?: {
    strictCSP?: boolean
    includeHSTS?: boolean
    reportUri?: string
  }) => ({
    'Strict-Transport-Security':
      config?.includeHSTS !== false
        ? 'max-age=31536000; includeSubDomains; preload'
        : undefined,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Expect-CT': 'max-age=86400, enforce',
    'Content-Security-Policy': config?.strictCSP
      ? securityHeaders.getStrictCSP(config)
      : securityHeaders.getStandardCSP(config),
  }),

  /**
   * Get standard CSP for normal operation
   */
  getStandardCSP: (config?: { reportUri?: string; reportTo?: string }) => {
    const baseCSP = "default-src 'self';"
    const scriptCSP = "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;"
    const styleCSP = "style-src 'self' 'unsafe-inline' https:;"
    const imgCSP = "img-src 'self' data: https: blob:;"
    const fontCSP = "font-src 'self' data: https:;"
    const connectCSP =
      "connect-src 'self' https://api.tcdynamics.fr wss://api.tcdynamics.fr;"
    const frameCSP = "frame-ancestors 'none';"
    const baseURICSP = "base-uri 'self';"
    const formActionCSP = "form-action 'self';"

    // Add reporting endpoints if configured
    const reportingCSP = securityHeaders.getReportingCSP(config)

    return `${baseCSP} ${scriptCSP} ${styleCSP} ${imgCSP} ${fontCSP} ${connectCSP} ${frameCSP} ${baseURICSP} ${formActionCSP} ${reportingCSP}`.trim()
  },

  /**
   * Get strict CSP for high-security environments
   */
  getStrictCSP: (config?: { reportUri?: string; reportTo?: string }) => {
    const baseCSP = "default-src 'self';"
    const scriptCSP = "script-src 'self';"
    const styleCSP = "style-src 'self' https:;"
    const imgCSP = "img-src 'self' data: https:;"
    const fontCSP = "font-src 'self' https:;"
    const connectCSP = "connect-src 'self' https://api.tcdynamics.fr;"
    const frameCSP = "frame-ancestors 'none';"
    const baseURICSP = "base-uri 'self';"
    const formActionCSP = "form-action 'self';"
    const objectCSP = "object-src 'none';"
    const mediaCSP = "media-src 'self' data: https:;"
    const workerCSP = "worker-src 'self' blob:;"

    // Add reporting endpoints if configured
    const reportingCSP = securityHeaders.getReportingCSP(config)

    return `${baseCSP} ${scriptCSP} ${styleCSP} ${imgCSP} ${fontCSP} ${connectCSP} ${frameCSP} ${baseURICSP} ${formActionCSP} ${objectCSP} ${mediaCSP} ${workerCSP} ${reportingCSP}`.trim()
  },

  /**
   * Get CSP reporting directives
   */
  getReportingCSP: (config?: { reportUri?: string; reportTo?: string }) => {
    const directives: string[] = []

    if (config?.reportUri) {
      directives.push(`report-uri ${config.reportUri}`)
    }

    if (config?.reportTo) {
      directives.push(`report-to ${config.reportTo}`)
    }

    return directives.join(' ')
  },

  /**
   * Test CSP policy for violations
   */
  testCSP: (
    cspString: string
  ): { valid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Basic syntax validation
      const directives = cspString
        .split(';')
        .map(d => d.trim())
        .filter(d => d.length > 0)

      // Check for common CSP issues
      const hasDefaultSrc = directives.some(d => d.startsWith('default-src'))
      const hasScriptSrc = directives.some(d => d.startsWith('script-src'))
      const hasStyleSrc = directives.some(d => d.startsWith('style-src'))

      if (!hasDefaultSrc && !hasScriptSrc) {
        warnings.push(
          'No default-src or script-src directive found - this may block legitimate scripts'
        )
      }

      if (!hasDefaultSrc && !hasStyleSrc) {
        warnings.push(
          'No default-src or style-src directive found - this may block legitimate styles'
        )
      }

      // Check for unsafe directives
      directives.forEach(directive => {
        const lowerDirective = directive.toLowerCase()
        if (lowerDirective.includes("'unsafe-inline'")) {
          warnings.push(`Directive contains 'unsafe-inline': ${directive}`)
        }
        if (lowerDirective.includes("'unsafe-eval'")) {
          warnings.push(`Directive contains 'unsafe-eval': ${directive}`)
        }
        if (lowerDirective.includes('data:')) {
          warnings.push(
            `Directive allows data: URIs which can be unsafe: ${directive}`
          )
        }
        if (lowerDirective.includes('http:')) {
          warnings.push(
            `Directive allows HTTP (non-HTTPS) resources: ${directive}`
          )
        }
      })

      // Check for missing important directives
      const hasBaseUri = directives.some(d => d.trim().startsWith('base-uri'))
      const hasFormAction = directives.some(d =>
        d.trim().startsWith('form-action')
      )
      const hasFrameAncestors = directives.some(d =>
        d.trim().startsWith('frame-ancestors')
      )

      if (!hasBaseUri) {
        errors.push(
          'Missing base-uri directive - base tag injection attacks possible'
        )
      }

      if (!hasFormAction) {
        errors.push(
          'Missing form-action directive - form action hijacking possible'
        )
      }

      if (!hasFrameAncestors) {
        errors.push(
          'Missing frame-ancestors directive - clickjacking protection limited'
        )
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      }
    } catch (error) {
      errors.push(
        `CSP parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      return {
        valid: false,
        errors,
        warnings,
      }
    }
  },

  /**
   * Validate security headers configuration
   */
  validateHeaders: (
    headers: Record<string, string>
  ): { valid: boolean; issues: string[] } => {
    const issues: string[] = []

    // Check for required headers
    const requiredHeaders = [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
    ]
    requiredHeaders.forEach(header => {
      if (!headers[header]) {
        issues.push(`Missing required header: ${header}`)
      }
    })

    // Check HSTS configuration
    const hsts = headers['Strict-Transport-Security']
    if (hsts) {
      if (!hsts.includes('max-age=')) {
        issues.push('HSTS missing max-age directive')
      }
      if (!hsts.includes('includeSubDomains')) {
        issues.push('HSTS should include subdomains for better security')
      }
    }

    // Check CSP configuration
    const csp = headers['Content-Security-Policy']
    let hasErrors = false
    if (csp) {
      const cspTest = securityHeaders.testCSP(csp)
      issues.push(...cspTest.warnings)
      if (!cspTest.valid) {
        issues.push(...cspTest.errors)
        hasErrors = cspTest.errors.length > 0
      }
    } else {
      issues.push('Missing Content-Security-Policy header')
      hasErrors = true
    }

    return {
      valid: !hasErrors, // Valid if no errors, warnings are acceptable
      issues,
    }
  },

  /**
   * Validate allowed origins for CORS
   */
  isAllowedOrigin: (origin: string | null): boolean => {
    if (!origin) return false

    const allowedOrigins = [
      'https://tcdynamics.fr',
      'https://www.tcdynamics.fr',
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
    ]

    try {
      const url = new URL(origin)
      return allowedOrigins.includes(url.origin)
    } catch {
      return false
    }
  },
}

// ========== UTILITIES ==========

export const securityUtils = {
  /**
   * Generate a cryptographically secure random string
   */
  generateSecureId: (length: number = 32): string => {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    )
  },

  /**
   * Hash a string using SHA-256 (for caching keys, not passwords)
   */
  hashString: async (input: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  },

  /**
   * Check if the current environment is development
   */
  isDevelopment: (): boolean => {
    return import.meta.env.DEV || import.meta.env.MODE === 'development'
  },

  /**
   * Log security events
   */
  logSecurityEvent: (event: string, details: unknown): void => {
    logger.warn(`Security event: ${event}`, { details })
  },
}

// ========== CLEANUP ==========

// Cleanup rate limiters on process exit (for Node.js environments)
if (typeof process !== 'undefined' && process.on) {
  process.on('exit', () => {
    Object.values(rateLimiters).forEach(limiter => limiter.destroy())
  })

  process.on('SIGINT', () => {
    Object.values(rateLimiters).forEach(limiter => limiter.destroy())
    process.exit()
  })
}
