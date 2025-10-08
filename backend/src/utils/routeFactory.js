const { createTransporter, emailTemplates } = require('../config/email')
const { logger } = require('./logger')

/**
 * Configuration for email route handler
 * @typedef {Object} EmailRouteConfig
 * @property {string} templateName - Name of the email template to use (e.g., 'contact', 'demo')
 * @property {string} routeName - Name for logging purposes (e.g., 'contact', 'demo')
 * @property {string} successMessage - Message to return on successful email send
 * @property {string} errorMessage - Message to return on error
 * @property {Function} [dataMapper] - Optional function to map request body to email data
 */

/**
 * Creates a standardized email route handler with consistent error handling and logging
 *
 * This factory function eliminates duplication across email-sending routes by:
 * - Standardizing email transporter creation and verification
 * - Providing consistent error handling
 * - Centralizing logging logic
 * - Ensuring uniform response format
 *
 * @param {EmailRouteConfig} config - Configuration for the route handler
 * @returns {Function} Express route handler function
 *
 * @example
 * // Create a contact form handler
 * const contactHandler = createEmailRouteHandler({
 *   templateName: 'contact',
 *   routeName: 'contact',
 *   successMessage: 'Message sent successfully',
 *   errorMessage: 'Failed to send message',
 *   dataMapper: (body) => ({
 *     name: body.name,
 *     email: body.email,
 *     message: body.message
 *   })
 * })
 *
 * router.post('/contact', formRateLimit, validateData(schema), contactHandler)
 */
const createEmailRouteHandler = config => {
  const {
    templateName,
    routeName,
    successMessage,
    errorMessage,
    dataMapper = body => body, // Default: pass through body as-is
  } = config

  // Validate configuration
  if (!emailTemplates[templateName]) {
    throw new Error(`Email template '${templateName}' not found`)
  }

  // Return the route handler
  return async (req, res) => {
    // Extract and optionally transform the request data
    const emailData = dataMapper(req.body)
    const { email } = req.body // Extract for logging/reply-to

    try {
      // Create and verify email transporter
      const transporter = createTransporter()
      await transporter.verify()

      logger.info(`Email server ready for ${routeName}`, {
        emailService: process.env.EMAIL_USER,
        route: routeName,
      })

      // Prepare email using template
      const emailContent = emailTemplates[templateName](emailData)

      // Send email
      const info = await transporter.sendMail({
        from: `"TCDynamics ${routeName.charAt(0).toUpperCase() + routeName.slice(1)}" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to configured recipient
        replyTo: email, // Allow direct reply to sender
        ...emailContent,
      })

      // Log success
      logger.info(`Email sent successfully for ${routeName}`, {
        messageId: info.messageId,
        sender: email,
        recipient: process.env.EMAIL_USER,
        route: routeName,
      })

      // Return success response
      res.status(200).json({
        success: true,
        message: successMessage,
        messageId: info.messageId,
      })
    } catch (error) {
      // Log error with context
      logger.error(`Error sending email for ${routeName}`, {
        error: error.message,
        stack: error.stack,
        submitterEmail: email ?? 'unknown',
        route: routeName,
        action: `send_${routeName}_email`,
      })

      // Return error response
      res.status(500).json({
        success: false,
        message: errorMessage,
        errors: [error.message],
      })
    }
  }
}

/**
 * Helper function to create standard data mappers for common form fields
 *
 * @param {string[]} fields - Array of field names to extract from body
 * @returns {Function} Data mapper function
 *
 * @example
 * const mapper = createDataMapper(['name', 'email', 'phone', 'message'])
 * // Extracts only specified fields from request body
 */
const createDataMapper = fields => {
  return body => {
    const mapped = {}
    fields.forEach(field => {
      if (body[field] !== undefined) {
        mapped[field] = body[field]
      }
    })
    return mapped
  }
}

module.exports = {
  createEmailRouteHandler,
  createDataMapper,
}
