const { createEmailRouteHandler, createDataMapper } = require('../routeFactory')
const { emailTemplates } = require('../../config/email')

// Mock dependencies
jest.mock('../../config/email', () => ({
  createTransporter: jest.fn(),
  emailTemplates: {
    contact: jest.fn(),
    demo: jest.fn(),
  },
}))

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

const { createTransporter } = require('../../config/email')
const { logger } = require('../logger')

describe('routeFactory', () => {
  let req; let res; let
    mockTransporter

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock request
    req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+33123456789',
        company: 'Test Corp',
        message: 'Test message',
      },
    }

    // Mock response
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Mock transporter
    mockTransporter = {
      verify: jest.fn().mockResolvedValue(true),
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'test-message-id-123',
      }),
    }

    // Setup default mock implementations
    createTransporter.mockReturnValue(mockTransporter)
    emailTemplates.contact.mockReturnValue({
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
    })
    emailTemplates.demo.mockReturnValue({
      subject: 'Test Demo Subject',
      html: '<p>Test Demo HTML</p>',
    })
  })

  describe('createEmailRouteHandler', () => {
    it('should throw error if template does not exist', () => {
      expect(() => {
        createEmailRouteHandler({
          templateName: 'nonexistent',
          routeName: 'test',
          successMessage: 'Success',
          errorMessage: 'Error',
        })
      }).toThrow("Email template 'nonexistent' not found")
    })

    it('should create a route handler function', () => {
      const handler = createEmailRouteHandler({
        templateName: 'contact',
        routeName: 'contact',
        successMessage: 'Message sent successfully',
        errorMessage: 'Failed to send message',
      })

      expect(typeof handler).toBe('function')
      expect(handler.length).toBe(2) // req, res
    })

    it('should send email successfully with contact template', async () => {
      const handler = createEmailRouteHandler({
        templateName: 'contact',
        routeName: 'contact',
        successMessage: 'Message sent successfully',
        errorMessage: 'Failed to send message',
      })

      await handler(req, res)

      // Verify transporter was created and verified
      expect(createTransporter).toHaveBeenCalledTimes(1)
      expect(mockTransporter.verify).toHaveBeenCalledTimes(1)

      // Verify template was called with request data
      expect(emailTemplates.contact).toHaveBeenCalledWith(req.body)

      // Verify email was sent
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('TCDynamics Contact'),
          to: process.env.EMAIL_USER,
          replyTo: 'john@example.com',
          subject: 'Test Subject',
          html: '<p>Test HTML</p>',
        }),
      )

      // Verify success response
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Message sent successfully',
        messageId: 'test-message-id-123',
      })

      // Verify logging
      expect(logger.info).toHaveBeenCalledTimes(2)
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

    it('should send email successfully with demo template', async () => {
      const handler = createEmailRouteHandler({
        templateName: 'demo',
        routeName: 'demo',
        successMessage: 'Demo request sent',
        errorMessage: 'Failed to send demo request',
      })

      await handler(req, res)

      expect(emailTemplates.demo).toHaveBeenCalledWith(req.body)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('TCDynamics Demo'),
          subject: 'Test Demo Subject',
        }),
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Demo request sent',
        messageId: 'test-message-id-123',
      })
    })

    it('should handle transporter verification failure', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'))

      const handler = createEmailRouteHandler({
        templateName: 'contact',
        routeName: 'contact',
        successMessage: 'Success',
        errorMessage: 'Failed to send',
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to send',
        errors: ['Connection failed'],
      })

      expect(logger.error).toHaveBeenCalledWith(
        'Error sending email for contact',
        expect.objectContaining({
          error: 'Connection failed',
          route: 'contact',
        }),
      )
    })

    it('should handle sendMail failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('Send failed'))

      const handler = createEmailRouteHandler({
        templateName: 'contact',
        routeName: 'contact',
        successMessage: 'Success',
        errorMessage: 'Failed to send',
      })

      await handler(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to send',
        errors: ['Send failed'],
      })
    })

    it('should use custom dataMapper if provided', async () => {
      const customMapper = jest.fn(body => ({
        customField: body.name.toUpperCase(),
        email: body.email,
      }))

      const handler = createEmailRouteHandler({
        templateName: 'contact',
        routeName: 'contact',
        successMessage: 'Success',
        errorMessage: 'Error',
        dataMapper: customMapper,
      })

      await handler(req, res)

      expect(customMapper).toHaveBeenCalledWith(req.body)
      expect(emailTemplates.contact).toHaveBeenCalledWith({
        customField: 'JOHN DOE',
        email: 'john@example.com',
      })
    })

    it('should handle missing email in request body', async () => {
      req.body.email = undefined

      const handler = createEmailRouteHandler({
        templateName: 'contact',
        routeName: 'contact',
        successMessage: 'Success',
        errorMessage: 'Error',
      })

      await handler(req, res)

      // Should still attempt to send email
      expect(mockTransporter.sendMail).toHaveBeenCalled()

      // Should log with 'unknown' email
      expect(logger.info).toHaveBeenCalledWith(
        'Email sent successfully for contact',
        expect.objectContaining({
          sender: undefined,
        }),
      )
    })

    it('should properly capitalize route name in "from" field', async () => {
      const handler = createEmailRouteHandler({
        templateName: 'contact',
        routeName: 'support',
        successMessage: 'Success',
        errorMessage: 'Error',
      })

      await handler(req, res)

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('TCDynamics Support'),
        }),
      )
    })
  })

  describe('createDataMapper', () => {
    it('should extract specified fields from body', () => {
      const mapper = createDataMapper(['name', 'email', 'message'])

      const result = mapper({
        name: 'John',
        email: 'john@test.com',
        message: 'Hello',
        extra: 'should not be included',
        another: 'also excluded',
      })

      expect(result).toEqual({
        name: 'John',
        email: 'john@test.com',
        message: 'Hello',
      })
    })

    it('should handle missing fields gracefully', () => {
      const mapper = createDataMapper(['name', 'email', 'phone'])

      const result = mapper({
        name: 'John',
        email: 'john@test.com',
        // phone is missing
      })

      expect(result).toEqual({
        name: 'John',
        email: 'john@test.com',
      })
    })

    it('should handle empty body', () => {
      const mapper = createDataMapper(['name', 'email'])

      const result = mapper({})

      expect(result).toEqual({})
    })

    it('should include undefined values if explicitly set', () => {
      const mapper = createDataMapper(['name', 'email'])

      const result = mapper({
        name: 'John',
        email: undefined,
      })

      expect(result).toEqual({
        name: 'John',
        email: undefined,
      })
    })
  })
})
