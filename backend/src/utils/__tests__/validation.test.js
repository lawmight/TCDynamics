// Mock Joi for testing
jest.mock('joi', () => {
  const mockString = () => ({
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis(),
    required: jest.fn().mockReturnThis(),
    email: jest.fn().mockReturnThis(),
    pattern: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    allow: jest.fn().mockReturnThis(),
    messages: jest.fn().mockReturnThis(),
  })

  const mockNumber = () => ({
    min: jest.fn().mockReturnThis(),
    max: jest.fn().mockReturnThis(),
    required: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    messages: jest.fn().mockReturnThis(),
  })

  return {
    object: jest.fn(() => ({
      keys: jest.fn().mockReturnThis(),
      pattern: jest.fn().mockReturnThis(),
      messages: jest.fn().mockReturnThis(),
      validate: jest.fn(),
    })),
    string: jest.fn(() => mockString()),
    number: jest.fn(() => mockNumber()),
  }
})

const Joi = require('joi')

describe('Validation Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateData middleware', () => {
    it('should validate valid data successfully', async () => {
      const mockSchema = {
        validate: jest
          .fn()
          .mockReturnValue({ error: null, value: { name: 'John' } }),
      }

      const validateData = require('../validation').validateData

      const req = { body: { name: 'John' } }
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
      const next = jest.fn()

      await validateData(mockSchema)(req, res, next)

      expect(mockSchema.validate).toHaveBeenCalledWith(req.body, {
        abortEarly: false,
        stripUnknown: true,
      })
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      const validationError = {
        details: [{ message: 'Name is required', path: ['name'] }],
      }

      const mockSchema = {
        validate: jest.fn().mockReturnValue({ error: validationError }),
      }

      const validateData = require('../validation').validateData

      const req = { body: {} }
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
      const next = jest.fn()

      await validateData(mockSchema)(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Données invalides',
        errors: ['Name is required'],
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle Joi validation errors with multiple fields', async () => {
      const validationError = {
        details: [
          { message: 'Name is required', path: ['name'] },
          { message: 'Email is invalid', path: ['email'] },
        ],
      }

      const mockSchema = {
        validate: jest.fn().mockReturnValue({ error: validationError }),
      }

      const validateData = require('../validation').validateData

      const req = { body: {} }
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
      const next = jest.fn()

      await validateData(mockSchema)(req, res, next)

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Données invalides',
        errors: ['Name is required', 'Email is invalid'],
      })
    })

    it('should handle missing error details', async () => {
      const mockSchema = {
        validate: jest.fn().mockReturnValue({ error: null }),
      }

      const validateData = require('../validation').validateData

      const req = { body: { name: 'John' } }
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
      const next = jest.fn()

      await validateData(mockSchema)(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('Schema definitions', () => {
    it('should export contactSchema', () => {
      const { contactSchema } = require('../validation')
      expect(contactSchema).toBeDefined()
    })

    it('should export demoSchema', () => {
      const { demoSchema } = require('../validation')
      expect(demoSchema).toBeDefined()
    })

    it('should have proper Joi schema structure', () => {
      // This test would verify the actual schema structure
      // For now, just ensure the schemas are objects
      const { contactSchema, demoSchema } = require('../validation')

      expect(typeof contactSchema).toBe('object')
      expect(typeof demoSchema).toBe('object')
    })
  })
})
