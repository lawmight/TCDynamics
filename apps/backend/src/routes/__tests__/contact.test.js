// Mock dependencies BEFORE importing modules
jest.mock('../../config/email', () => ({
  createTransporter: jest.fn(),
  emailTemplates: {
    contact: jest.fn(),
  },
}))

jest.mock('../../utils/validation', () => ({
  validateData: jest.fn(_schema => (req, res, next) => {
    // Simple validation for testing
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis manquants',
        errors: ['Required fields missing'],
      })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format d'email invalide",
        errors: ['Invalid email'],
      })
    }
    next()
  }),
  contactSchema: {},
}))

jest.mock('../../middleware/security', () => ({
  formRateLimit: (req, res, next) => next(),
}))

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

const request = require('supertest')
const express = require('express')

// Import after mocks are set up
const { createTransporter, emailTemplates } = require('../../config/email')
const { logger } = require('../../utils/logger')

// Import the actual router (which now uses the factory)
const contactRouter = require('../contact')

describe('Contact Route', () => {
  let app
  let mockTransporter
  let mockVerify
  let mockSendMail

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup email transporter mock
    mockVerify = jest.fn()
    mockSendMail = jest.fn()
    mockTransporter = {
      verify: mockVerify,
      sendMail: mockSendMail,
    }
    createTransporter.mockReturnValue(mockTransporter)

    // Setup email templates mock
    emailTemplates.contact.mockReturnValue({
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
      text: 'Test Text',
    })

    // Create express app for testing
    app = express()
    app.use(express.json({ limit: '1mb' }))

    // Add the actual refactored router
    app.use('/api', contactRouter)

    // Mock environment variables
    process.env.EMAIL_USER = 'test@example.com'
  })

  describe('POST /contact', () => {
    const validContactData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+33123456789',
      company: 'Test Company',
      message: 'This is a test message',
    }

    it('should send contact email successfully', async () => {
      // Mock successful email sending
      mockVerify.mockResolvedValue(true)
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id-123',
      })

      const response = await request(app)
        .post('/api/contact')
        .send(validContactData)
        .expect(200)

      expect(response.body).toEqual({
        success: true,
        message:
          'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        messageId: 'test-message-id-123',
      })

      // Verify transporter was created and verified
      expect(createTransporter).toHaveBeenCalled()
      expect(mockVerify).toHaveBeenCalled()
      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"TCDynamics Contact" <test@example.com>',
        to: 'test@example.com',
        replyTo: 'john@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      })

      // Verify logging (updated for factory pattern)
      expect(logger.info).toHaveBeenCalledWith(
        'Email server ready for contact',
        expect.any(Object),
      )
      expect(logger.info).toHaveBeenCalledWith(
        'Email sent successfully for contact',
        expect.objectContaining({
          messageId: 'test-message-id-123',
          sender: 'john@example.com',
        }),
      )
    })

    it('should handle email verification failure', async () => {
      mockVerify.mockRejectedValue(new Error('Email verification failed'))

      const response = await request(app)
        .post('/api/contact')
        .send(validContactData)
        .expect(500)

      expect(response.body).toMatchObject({
        success: false,
        message:
          "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard.",
      })

      expect(logger.error).toHaveBeenCalledWith(
        'Error sending email for contact',
        expect.objectContaining({
          error: 'Email verification failed',
          route: 'contact',
        }),
      )
    })

    it('should handle email sending failure', async () => {
      mockVerify.mockResolvedValue(true)
      mockSendMail.mockRejectedValue(new Error('Email sending failed'))

      const response = await request(app)
        .post('/api/contact')
        .send(validContactData)
        .expect(500)

      expect(response.body).toMatchObject({
        success: false,
        message:
          "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard.",
      })

      expect(logger.error).toHaveBeenCalledWith(
        'Error sending email for contact',
        expect.objectContaining({
          error: 'Email sending failed',
          route: 'contact',
        }),
      )
    })

    // Note: Les middlewares formRateLimit et validateData sont mockés
    // mais pas utilisés dans cette version de test pour simplifier
    // Dans la vraie application, ils seraient appliqués avant la route

    it('should handle missing required fields', async () => {
      const invalidData = {
        name: 'John Doe',
        // Missing email and message
      }

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Champs requis manquants')
    })

    it('should handle malformed email address', async () => {
      const invalidData = {
        ...validContactData,
        email: 'invalid-email',
      }

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("Format d'email invalide")
    })

    it('should handle very long message', async () => {
      const longMessage = 'a'.repeat(10000)
      const dataWithLongMessage = {
        ...validContactData,
        message: longMessage,
      }

      mockVerify.mockResolvedValue(true)
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id-long',
      })

      const response = await request(app)
        .post('/api/contact')
        .send(dataWithLongMessage)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(emailTemplates.contact).toHaveBeenCalledWith(
        expect.objectContaining({
          message: longMessage,
        }),
      )
    })

    it('should handle special characters in company name', async () => {
      const specialCompanyData = {
        ...validContactData,
        company: 'Test & Co. "Special" GmbH',
      }

      mockVerify.mockResolvedValue(true)
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id-special',
      })

      const response = await request(app)
        .post('/api/contact')
        .send(specialCompanyData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(emailTemplates.contact).toHaveBeenCalledWith(
        expect.objectContaining({
          company: 'Test & Co. "Special" GmbH',
        }),
      )
    })

    it('should handle international phone numbers', async () => {
      const internationalData = {
        ...validContactData,
        phone: '+44 20 7946 0958',
      }

      mockVerify.mockResolvedValue(true)
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id-international',
      })

      const response = await request(app)
        .post('/api/contact')
        .send(internationalData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(emailTemplates.contact).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+44 20 7946 0958',
        }),
      )
    })

    it('should handle empty optional fields', async () => {
      const minimalData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        // No phone, company
      }

      mockVerify.mockResolvedValue(true)
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id-minimal',
      })

      const response = await request(app)
        .post('/api/contact')
        .send(minimalData)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should handle request without JSON body', async () => {
      const response = await request(app)
        .post('/api/contact')
        .set('Content-Type', 'application/json')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Champs requis manquants')
    })

    it('should handle extremely large payloads', async () => {
      const largeData = {
        ...validContactData,
        message: 'a'.repeat(2000000), // 2MB message (exceeds 1MB limit)
      }

      const response = await request(app).post('/api/contact').send(largeData)

      // Either 413 (payload too large) or 500 (parsing error) is acceptable
      expect([413, 500]).toContain(response.status)
    })
  })
})
