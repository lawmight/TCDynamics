const express = require('express')
const { formRateLimit } = require('../middleware/security')
const { logger } = require('../utils/logger')
const { saveFeedback } = require('../../../../api/_lib/mongodb-db.js')

const router = express.Router()

/**
 * POST /api/feedback
 * Save customer feedback to MongoDB
 */
router.post('/feedback', formRateLimit, async (req, res) => {
  try {
    // Validate request body
    const {
      form_type,
      rating,
      feedback_text,
      user_email,
      user_company,
      allow_followup,
      clerkId,
    } = req.body

    // Validate required fields
    if (!form_type || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: form_type and rating',
        errors: ['form_type and rating are required'],
      })
    }

    // Validate rating is between 1-5
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating value',
        errors: ['Rating must be a number between 1 and 5'],
      })
    }

    // Save feedback to MongoDB
    const result = await saveFeedback({
      form_type,
      rating,
      feedback_text,
      user_email,
      user_company,
      allow_followup,
      clerkId,
    })

    if (!result.success) {
      logger.error('Failed to save feedback to MongoDB', {
        error: result.error,
        feedback: { form_type, rating },
      })

      return res.status(500).json({
        success: false,
        message: 'Failed to save feedback. Please try again.',
      })
    }

    logger.info('Feedback saved successfully', {
      form_type,
      rating,
      id: result.id,
    })

    return res.status(200).json({
      success: true,
      message: 'Feedback saved successfully',
      data: { id: result.id },
    })
  } catch (error) {
    logger.error('Error processing feedback request', {
      error: error.message,
      stack: error.stack,
    })

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'production'
          ? 'An error occurred while processing your feedback. Please try again later.'
          : 'Failed to process feedback',
      ...(process.env.NODE_ENV !== 'production' && { errors: [error.message] }),
    })
  }
})

module.exports = router
