// src/utils/security.ts
// Security utilities for input sanitization, validation, and protection

import DOMPurify from 'isomorphic-dompurify'

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
    return phone.replace(/[^+\d\s\-\(\)]/g, '').trim()
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
  getSecurityHeaders: () => ({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';",
  }),

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
  logSecurityEvent: (event: string, details: any): void => {
    const timestamp = new Date().toISOString()
    console.warn(`[SECURITY] ${timestamp} - ${event}:`, details)
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
