import {
  validateEmail,
  validateName,
  validateMessage,
  validatePhone,
  validateFormData,
} from '../validation.js'

describe('Backend Validation Middleware', () => {
  describe('validateEmail', () => {
    it('should validate valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ]

      validEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..double@example.com',
        'user@.com',
        '',
        'user@-example.com',
      ]

      invalidEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })

    it('should detect disposable email addresses', () => {
      const disposableEmails = [
        'user@10minutemail.com',
        'test@tempmail.org',
        'temp@garroffmail.com',
      ]

      disposableEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.warnings.length).toBeGreaterThan(0)
        expect(result.warnings[0]).toContain('adresse email temporaire')
      })
    })

    it('should handle edge cases', () => {
      // Too long email
      const longEmail = 'a'.repeat(255) + '@example.com'
      const result = validateEmail(longEmail)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('trop long')

      // Empty string
      const emptyResult = validateEmail('')
      expect(emptyResult.valid).toBe(false)
      expect(emptyResult.errors[0]).toContain('ne peut pas être vide')

      // Non-string input
      const nonStringResult = validateEmail(123)
      expect(nonStringResult.valid).toBe(false)
      expect(nonStringResult.errors[0]).toContain('chaîne de caractères')
    })
  })

  describe('validateName', () => {
    it('should validate valid names', () => {
      const validNames = [
        'Jean Dupont',
        'Marie-Claire',
        'José María',
        '李小明',
        'محمد',
      ]

      validNames.forEach(name => {
        const result = validateName(name)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        '',
        'A',
        '123',
        '   ',
        'Special!@#$%',
      ]

      invalidNames.forEach(name => {
        const result = validateName(name)
        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })

    it('should detect suspicious name patterns', () => {
      const suspiciousNames = [
        'AAAAABBBBB',
        'Johnnnn',
        'Maryyyyy',
      ]

      suspiciousNames.forEach(name => {
        const result = validateName(name)
        expect(result.warnings.length).toBeGreaterThan(0)
        expect(result.warnings[0]).toContain('caractères répétés')
      })
    })

    it('should handle non-string input', () => {
      const result = validateName(123)
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('chaîne de caractères')
    })
  })

  describe('validateMessage', () => {
    it('should validate valid messages', () => {
      const validMessages = [
        'This is a valid message with enough characters.',
        'Bonjour, je souhaite obtenir plus d\'informations.',
        'This message contains exactly 10 characters.',
      ]

      validMessages.forEach(message => {
        const result = validateMessage(message, 10, 5000, 'Message')
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject messages that are too short', () => {
      const shortMessages = [
        'Too short',
        '123456789', // 9 characters
        '',
      ]

      shortMessages.forEach(message => {
        const result = validateMessage(message, 10, 5000, 'Message')
        expect(result.valid).toBe(false)
        expect(result.errors[0]).toContain('au moins 10 caractères')
      })
    })

    it('should reject messages that are too long', () => {
      const longMessage = 'A'.repeat(5001)
      const result = validateMessage(longMessage, 10, 5000, 'Message')
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('trop long')
    })

    it('should detect spam patterns', () => {
      const spamMessages = [
        'Contact me at spam@example.com for more info',
        'Call me at 555-123-4567 for deals',
        'Visit our website at http://example.com',
        'This!!! message??? has!!! too!!! many!!! punctuation!!!',
        'THIS MESSAGE IS ALL CAPS AND SUSPICIOUS',
      ]

      spamMessages.forEach(message => {
        const result = validateMessage(message, 10, 5000, 'Message')
        expect(result.warnings.length).toBeGreaterThan(0)
      })
    })

    it('should handle custom field names', () => {
      const result = validateMessage('Valid message', 10, 5000, 'Besoins spécifiques')
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })
  })

  describe('validatePhone', () => {
    it('should validate valid phone numbers', () => {
      const validPhones = [
        '+33 1 23 45 67 89',
        '01 23 45 67 89',
        '(555) 123-4567',
        '+1-555-123-4567',
        '555.123.4567',
      ]

      validPhones.forEach(phone => {
        const result = validatePhone(phone)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should allow empty phone numbers', () => {
      const result = validatePhone('')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        'not-a-phone',
        '123',
        '12345678901234567890', // Too long
        'abc-def-ghij',
      ]

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone)
        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
      })
    })

    it('should provide warnings for unusual phone numbers', () => {
      const unusualPhones = [
        '1234567', // Too short
        '123456789012345', // Very long but valid length
      ]

      unusualPhones.forEach(phone => {
        const result = validatePhone(phone)
        expect(result.warnings.length).toBeGreaterThan(0)
      })
    })
  })

  describe('validateFormData', () => {
    it('should validate contact form data', () => {
      const validContactData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        message: 'This is a valid contact message with enough characters.',
        phone: '+33 1 23 45 67 89',
        company: 'Example Corp',
      }

      const result = validateFormData(validContactData, 'contact')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate demo form data', () => {
      const validDemoData = {
        name: 'Marie Dupont',
        email: 'marie.dupont@example.com',
        businessNeeds: 'We need automation for our business processes.',
        phone: '01 23 45 67 89',
        company: 'Tech Corp',
        companySize: '51-200',
        industry: 'Technology',
        useCase: 'Process automation',
        timeline: '1-3 mois',
      }

      const result = validateFormData(validDemoData, 'demo')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid contact form data', () => {
      const invalidContactData = {
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
        message: 'short', // Too short
        phone: 'not-a-phone', // Invalid format
      }

      const result = validateFormData(invalidContactData, 'contact')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('name'))).toBe(true)
      expect(result.errors.some(error => error.includes('email'))).toBe(true)
      expect(result.errors.some(error => error.includes('message'))).toBe(true)
      expect(result.errors.some(error => error.includes('phone'))).toBe(true)
    })

    it('should reject invalid demo form data', () => {
      const invalidDemoData = {
        name: '', // Empty
        email: 'invalid-email', // Invalid format
        businessNeeds: 'short', // Too short
        companySize: 'invalid-size', // Not in allowed values
        timeline: 'invalid-timeline', // Not in allowed values
      }

      const result = validateFormData(invalidDemoData, 'demo')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle unknown validation schema', () => {
      const result = validateFormData({}, 'unknown-schema')
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Schéma de validation inconnu')
    })

    it('should provide warnings for suspicious content', () => {
      const suspiciousData = {
        name: 'AAAAA',
        email: 'temp@10minutemail.com',
        message: 'Contact me at spam@example.com for more info!!!',
      }

      const result = validateFormData(suspiciousData, 'contact')
      expect(result.valid).toBe(true) // Still valid
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('Integration Tests', () => {
    it('should handle all validation types together', () => {
      const comprehensiveData = {
        name: 'José María González Pérez',
        email: 'jose.gonzalez@company.co.uk',
        message: 'This is a comprehensive test message with valid content that should pass all validation checks.',
        phone: '+33 (0)1 23 45 67 89',
        company: 'International Corp Ltd.',
      }

      const result = validateFormData(comprehensiveData, 'contact')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('should handle edge cases gracefully', () => {
      // Test with null/undefined values
      const edgeCaseData = {
        name: null,
        email: undefined,
        message: '',
        phone: 123,
        company: '',
      }

      const result = validateFormData(edgeCaseData, 'contact')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})