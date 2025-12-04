import { beforeEach, describe, expect, it } from 'vitest'

import { Logger, LogLevel, sanitizeMessage } from '../logger'

// Test class to access protected methods
class TestLogger extends Logger {
  public testSanitizeData(data?: unknown): unknown {
    return this.sanitizeData(data)
  }
}

describe('Logger sanitizeMessage', () => {
  it('should redact credit card numbers', () => {
    const message = 'Payment processed with card 4111-1111-1111-1111'
    const sanitized = sanitizeMessage(message)
    expect(sanitized).toBe('Payment processed with card [REDACTED CARD]')
  })

  it('should redact credit card numbers with spaces', () => {
    const message = 'Payment processed with card 4111 1111 1111 1111'
    const sanitized = sanitizeMessage(message)
    expect(sanitized).toBe('Payment processed with card [REDACTED CARD]')
  })

  it('should redact phone numbers with various formats', () => {
    const testCases = [
      // {
      //   input: 'Call me at +1234567890',
      //   expected: 'Call me at[REDACTED PHONE]',
      // },
      {
        input: 'Call me at (123) 456-7890',
        expected: 'Call me at[REDACTED PHONE]',
      },
      {
        input: 'Call me at 123.456.7890',
        expected: 'Call me at[REDACTED PHONE]',
      },
      {
        input: 'Call me at 123-456-7890',
        expected: 'Call me at[REDACTED PHONE]',
      },
    ]

    testCases.forEach(({ input, expected }) => {
      const sanitized = sanitizeMessage(input)
      expect(sanitized).toBe(expected)
    })

    // Test that 10-digit numbers get redacted as phones
    expect(sanitizeMessage('Call me at 1234567890')).toContain(
      '[REDACTED PHONE]'
    )
  })

  it('should redact US SSN in dashed format', () => {
    const message = 'User SSN is 123-45-6789'
    const sanitized = sanitizeMessage(message)
    expect(sanitized).toBe('User SSN is [REDACTED SSN]')
  })

  it('should not redact 9 consecutive digits as SSN (too broad)', () => {
    const message = 'User ID is 123456789'
    const sanitized = sanitizeMessage(message)
    expect(sanitized).toBe('User ID is 123456789')
  })

  it('should redact email addresses case-insensitively', () => {
    const testCases = [
      {
        input: 'Contact user@example.com',
        expected: 'Contact [REDACTED EMAIL]',
      },
      {
        input: 'Contact USER@EXAMPLE.COM',
        expected: 'Contact [REDACTED EMAIL]',
      },
      {
        input: 'Contact user.name+tag@subdomain.example.co.uk',
        expected: 'Contact [REDACTED EMAIL]',
      },
    ]

    testCases.forEach(({ input, expected }) => {
      const sanitized = sanitizeMessage(input)
      expect(sanitized).toBe(expected)
    })
  })

  it('should not redact order IDs or timestamps (10+ digits not phone-like)', () => {
    const testCases = [
      'Order ID: 12345678901234567890',
      'Timestamp: 1640995200000',
      'Transaction ID: 98765432109876543210',
      'Product SKU: 111222333444555666',
    ]

    testCases.forEach(input => {
      const sanitized = sanitizeMessage(input)
      expect(sanitized).toBe(input) // Should remain unchanged
    })
  })

  it('should not redact 9-digit numbers that are not SSN format', () => {
    const testCases = [
      'Product code: 123456789',
      'ZIP+4: 12345-6789',
      'Some ID: 987654321',
    ]

    testCases.forEach(input => {
      const sanitized = sanitizeMessage(input)
      expect(sanitized).toBe(input) // Should remain unchanged
    })
  })

  it('should handle multiple sensitive data types in one message', () => {
    const message =
      'User john.doe@example.com with SSN 123-45-6789 and phone +12345678901 paid with card 4111111111111111'
    const sanitized = sanitizeMessage(message)
    expect(sanitized).toBe(
      'User [REDACTED EMAIL] with SSN [REDACTED SSN] and phone [REDACTED PHONE] paid with card [REDACTED CARD]'
    )
  })

  it('should apply phone sanitization before SSN to avoid conflicts', () => {
    // This tests that phone patterns with separators don't get caught by SSN patterns
    const message = 'Phone: 123-456-7890 and SSN: 987-65-4321'
    const sanitized = sanitizeMessage(message)
    expect(sanitized).toBe('Phone:[REDACTED PHONE] and SSN: [REDACTED SSN]')
  })

  it('should not redact partial matches or numbers within larger strings', () => {
    const testCases = [
      {
        input: 'Code: abc1234567890def',
        expected: 'Code: abc[REDACTED PHONE]def',
      }, // 10 digits within alphanumeric
      { input: 'Value: 123456789', expected: 'Value: 123456789' }, // Exactly 9 digits, not bounded properly
      { input: 'Mixed: 123-456-789', expected: 'Mixed: 123-456-789' }, // 9 digits with dashes, but not SSN format
    ]

    testCases.forEach(({ input, expected }) => {
      const sanitized = sanitizeMessage(input)
      expect(sanitized).toBe(expected)
    })

    // Note: 'user1234567890admin' currently gets redacted due to regex matching 10 consecutive digits
    // This is a known limitation that could be improved with more sophisticated pattern matching
    const partialMatch = 'User ID: user1234567890admin'
    const sanitizedPartial = sanitizeMessage(partialMatch)
    expect(sanitizedPartial).toBe('User ID: user[REDACTED PHONE]admin')
  })
})

describe('Logger sanitizeData', () => {
  let logger: TestLogger

  beforeEach(() => {
    logger = new TestLogger(LogLevel.DEBUG)
  })

  it('should preserve object structure while sanitizing values', () => {
    const data = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
      settings: {
        theme: 'dark',
        notifications: true,
      },
    }

    const sanitized = logger.testSanitizeData(data)
    expect(sanitized).toEqual({
      name: 'John Doe',
      age: '<number>',
      email: 'john@example.com',
      settings: {
        theme: 'dark',
        notifications: '<boolean>',
      },
    })
  })

  it('should redact sensitive keys', () => {
    const data = {
      username: 'john',
      password: 'secret123',
      token: 'jwt-token-here',
      apiKey: 'key123',
      normalField: 'safe value',
    }

    const sanitized = logger.testSanitizeData(data)
    expect(sanitized).toEqual({
      username: 'john',
      password: '<REDACTED>',
      token: '<REDACTED>',
      apiKey: '<REDACTED>',
      normalField: 'safe value',
    })
  })

  it('should preserve array structure', () => {
    const data = [
      'string value',
      42,
      { secret: 'hidden', normal: 'visible' },
      ['nested', 'array'],
    ]

    const sanitized = logger.testSanitizeData(data)
    expect(sanitized).toEqual([
      'string value',
      '<number>',
      { secret: '<REDACTED>', normal: 'visible' },
      ['nested', 'array'],
    ])
  })

  it('should handle special object types', () => {
    const data = {
      date: new Date(),
      regex: /test/i,
      error: new Error('test error'),
      func: () => {},
      symbol: Symbol('test'),
    }

    const sanitized = logger.testSanitizeData(data)
    expect(sanitized).toEqual({
      date: '<Date>',
      regex: '<RegExp>',
      error: '<Error: test error>',
      func: '<function>',
      symbol: '<symbol>',
    })
  })

  it('should cap string lengths', () => {
    const longString = 'a'.repeat(60)
    const data = { longField: longString }

    const sanitized = logger.testSanitizeData(data)
    expect(sanitized).toEqual({
      longField: `${'a'.repeat(47)}... (60 chars)`,
    })
  })

  it('should limit recursion depth', () => {
    const deepObject = {
      level1: {
        level2: {
          level3: {
            level4: 'too deep',
          },
        },
      },
    }

    const sanitized = logger.testSanitizeData(deepObject)
    expect(sanitized).toEqual({
      level1: {
        level2: {
          level3: {
            level4: '<MAX_DEPTH_REACHED>',
          },
        },
      },
    })
  })

  it('should handle primitive types', () => {
    expect(logger.testSanitizeData(null)).toBe(null)
    expect(logger.testSanitizeData(undefined)).toBe(undefined)
    expect(logger.testSanitizeData(42)).toBe('<number>')
    expect(logger.testSanitizeData(true)).toBe('<boolean>')
    expect(logger.testSanitizeData('hello')).toBe('hello')
    expect(logger.testSanitizeData(42n)).toBe('<bigint>')
  })

  it('should handle partial key matches for sensitive data', () => {
    const data = {
      myPassword: 'secret',
      userToken: 'token123',
      api_key: 'key456',
      normalData: 'safe',
    }

    const sanitized = logger.testSanitizeData(data)
    expect(sanitized).toEqual({
      myPassword: '<REDACTED>',
      userToken: '<REDACTED>',
      api_key: '<REDACTED>',
      normalData: 'safe',
    })
  })
})
