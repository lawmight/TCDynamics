const Joi = require('joi')
const {
  createNameField,
  createEmailField,
  createPhoneField,
  createTextField,
  createSelectField,
  commonFields,
  MESSAGES_FR,
  PATTERNS,
} = require('../validationHelpers')

describe('validationHelpers', () => {
  describe('createNameField', () => {
    it('should create a required name field with default constraints', () => {
      const schema = Joi.object({ name: createNameField() })

      // Valid name
      const { error: validError } = schema.validate({ name: 'John Doe' })
      expect(validError).toBeUndefined()

      // Too short
      const { error: shortError } = schema.validate({ name: 'J' })
      expect(shortError).toBeDefined()
      expect(shortError.details[0].message).toContain('au moins 2 caractères')

      // Missing (required)
      const { error: missingError } = schema.validate({})
      expect(missingError).toBeDefined()
      expect(missingError.details[0].message).toContain('requis')
    })

    it('should create an optional name field when specified', () => {
      const schema = Joi.object({
        name: createNameField({ required: false }),
      })

      // Missing is OK
      const { error } = schema.validate({})
      expect(error).toBeUndefined()
    })

    it('should respect custom min/max constraints', () => {
      const schema = Joi.object({
        name: createNameField({ min: 5, max: 20 }),
      })

      // Too short (< 5)
      const { error: shortError } = schema.validate({ name: 'John' })
      expect(shortError).toBeDefined()

      // Just right
      const { error: validError } = schema.validate({ name: 'John Doe' })
      expect(validError).toBeUndefined()

      // Too long (> 20)
      const { error: longError } = schema.validate({
        name: 'This is a very long name that exceeds the limit',
      })
      expect(longError).toBeDefined()
    })

    it('should use custom label in error messages', () => {
      const schema = Joi.object({
        firstName: createNameField({ label: 'Le prénom' }),
      })

      const { error } = schema.validate({})
      expect(error.details[0].message).toContain('prénom')
    })
  })

  describe('createEmailField', () => {
    it('should validate correct email addresses', () => {
      const schema = Joi.object({ email: createEmailField() })

      const validEmails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'firstname.lastname@company.org',
      ]

      validEmails.forEach(email => {
        const { error } = schema.validate({ email })
        expect(error).toBeUndefined()
      })
    })

    it('should reject invalid email addresses', () => {
      const schema = Joi.object({ email: createEmailField() })

      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
      ]

      invalidEmails.forEach(email => {
        const { error } = schema.validate({ email })
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain('email valide')
      })
    })

    it('should require email by default', () => {
      const schema = Joi.object({ email: createEmailField() })

      const { error } = schema.validate({})
      expect(error).toBeDefined()
      expect(error.details[0].message).toContain('requis')
    })

    it('should allow optional email when specified', () => {
      const schema = Joi.object({
        email: createEmailField({ required: false }),
      })

      const { error } = schema.validate({})
      expect(error).toBeUndefined()
    })
  })

  describe('createPhoneField', () => {
    it('should validate international phone formats', () => {
      const schema = Joi.object({ phone: createPhoneField() })

      const validPhones = [
        '+33123456789',
        '+1 (555) 123-4567',
        '01 23 45 67 89',
        '+44 20 7946 0958',
        '0033123456789',
      ]

      validPhones.forEach(phone => {
        const { error } = schema.validate({ phone })
        expect(error).toBeUndefined()
      })
    })

    it('should reject invalid phone formats', () => {
      const schema = Joi.object({ phone: createPhoneField() })

      const invalidPhones = ['abc123', 'phone number', 'call-me-maybe']

      invalidPhones.forEach(phone => {
        const { error } = schema.validate({ phone })
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain('téléphone')
      })
    })

    it('should be optional by default', () => {
      const schema = Joi.object({ phone: createPhoneField() })

      const { error } = schema.validate({})
      expect(error).toBeUndefined()
    })

    it('should allow empty string', () => {
      const schema = Joi.object({ phone: createPhoneField() })

      const { error } = schema.validate({ phone: '' })
      expect(error).toBeUndefined()
    })
  })

  describe('createTextField', () => {
    it('should create a text field with max length', () => {
      const schema = Joi.object({
        text: createTextField({ max: 100 }),
      })

      const { error } = schema.validate({ text: 'a'.repeat(101) })
      expect(error).toBeDefined()
      expect(error.details[0].message).toContain('100 caractères')
    })

    it('should enforce minimum length when specified', () => {
      const schema = Joi.object({
        message: createTextField({ min: 10, max: 500, required: true }),
      })

      // Too short
      const { error: shortError } = schema.validate({ message: 'Short' })
      expect(shortError).toBeDefined()
      expect(shortError.details[0].message).toContain('au moins 10')

      // Just right
      const { error: validError } = schema.validate({
        message: 'This is a valid message',
      })
      expect(validError).toBeUndefined()
    })

    it('should be optional by default', () => {
      const schema = Joi.object({
        notes: createTextField({ max: 200 }),
      })

      const { error } = schema.validate({})
      expect(error).toBeUndefined()
    })

    it('should allow required text fields', () => {
      const schema = Joi.object({
        message: createTextField({ required: true }),
      })

      const { error } = schema.validate({})
      expect(error).toBeDefined()
      expect(error.details[0].message).toContain('requis')
    })

    it('should use custom label in messages', () => {
      const schema = Joi.object({
        description: createTextField({
          max: 100,
          required: true,
          label: 'La description',
        }),
      })

      const { error } = schema.validate({})
      expect(error.details[0].message).toContain('description')
    })
  })

  describe('createSelectField', () => {
    it('should validate allowed values', () => {
      const schema = Joi.object({
        size: createSelectField({
          values: ['small', 'medium', 'large'],
        }),
      })

      // Valid
      const { error: validError } = schema.validate({ size: 'medium' })
      expect(validError).toBeUndefined()

      // Invalid
      const { error: invalidError } = schema.validate({ size: 'extra-large' })
      expect(invalidError).toBeDefined()
    })

    it('should be optional by default', () => {
      const schema = Joi.object({
        category: createSelectField(),
      })

      const { error } = schema.validate({})
      expect(error).toBeUndefined()
    })

    it('should allow required select fields', () => {
      const schema = Joi.object({
        category: createSelectField({ required: true }),
      })

      const { error } = schema.validate({})
      expect(error).toBeDefined()
    })
  })

  describe('commonFields', () => {
    describe('firstName and lastName', () => {
      it('should validate names correctly', () => {
        const schema = Joi.object({
          firstName: commonFields.firstName(),
          lastName: commonFields.lastName(),
        })

        const validData = {
          firstName: 'John',
          lastName: 'Doe',
        }

        const { error } = schema.validate(validData)
        expect(error).toBeUndefined()
      })

      it('should enforce max length of 50', () => {
        const schema = Joi.object({
          firstName: commonFields.firstName(),
        })

        const { error } = schema.validate({
          firstName: 'A'.repeat(51),
        })
        expect(error).toBeDefined()
        expect(error.details[0].message).toContain('50')
      })
    })

    describe('fullName', () => {
      it('should accept full names', () => {
        const schema = Joi.object({ name: commonFields.fullName() })

        const { error } = schema.validate({
          name: 'Jean-Pierre de la Fontaine',
        })
        expect(error).toBeUndefined()
      })
    })

    describe('email', () => {
      it('should validate emails', () => {
        const schema = Joi.object({ email: commonFields.email() })

        const { error: validError } = schema.validate({
          email: 'user@example.com',
        })
        expect(validError).toBeUndefined()

        const { error: invalidError } = schema.validate({
          email: 'notanemail',
        })
        expect(invalidError).toBeDefined()
      })
    })

    describe('phone', () => {
      it('should validate phone numbers', () => {
        const schema = Joi.object({ phone: commonFields.phone() })

        const { error } = schema.validate({ phone: '+33123456789' })
        expect(error).toBeUndefined()
      })
    })

    describe('company', () => {
      it('should be optional by default', () => {
        const schema = Joi.object({
          company: commonFields.company(),
        })

        const { error } = schema.validate({})
        expect(error).toBeUndefined()
      })

      it('should be required when specified', () => {
        const schema = Joi.object({
          company: commonFields.company(true),
        })

        const { error } = schema.validate({})
        expect(error).toBeDefined()
      })
    })

    describe('message', () => {
      it('should require at least 10 characters', () => {
        const schema = Joi.object({
          message: commonFields.message(),
        })

        const { error: shortError } = schema.validate({ message: 'Short' })
        expect(shortError).toBeDefined()

        const { error: validError } = schema.validate({
          message: 'This is a valid message with enough characters',
        })
        expect(validError).toBeUndefined()
      })
    })

    describe('employees', () => {
      it('should be optional', () => {
        const schema = Joi.object({
          employees: commonFields.employees(),
        })

        const { error } = schema.validate({})
        expect(error).toBeUndefined()
      })
    })

    describe('notes', () => {
      it('should accept custom max length', () => {
        const schema = Joi.object({
          notes: commonFields.notes(500),
        })

        const { error: validError } = schema.validate({
          notes: 'A'.repeat(500),
        })
        expect(validError).toBeUndefined()

        const { error: invalidError } = schema.validate({
          notes: 'A'.repeat(501),
        })
        expect(invalidError).toBeDefined()
      })
    })
  })

  describe('MESSAGES_FR', () => {
    it('should have French error messages', () => {
      expect(MESSAGES_FR.required('Le nom')).toBe('Le nom est requis')
      expect(MESSAGES_FR.email).toContain('email valide')
      expect(MESSAGES_FR.minLength('Le message', 10)).toContain('au moins 10')
      expect(MESSAGES_FR.maxLength('Le nom', 50)).toContain('50 caractères')
    })
  })

  describe('PATTERNS', () => {
    it('should have phone pattern', () => {
      expect(PATTERNS.phone).toBeDefined()
      expect(PATTERNS.phone.test('+33123456789')).toBe(true)
      expect(PATTERNS.phone.test('invalid')).toBe(false)
    })
  })
})
