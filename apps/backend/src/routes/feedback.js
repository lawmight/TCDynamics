const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const { formRateLimit } = require('../middleware/security')
const { logger } = require('../utils/logger')

const router = express.Router()

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  logger.warn('Supabase credentials not found in environment variables')
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * POST /api/feedback
 * Save customer feedback to Supabase
 */
router.post(
  '/feedback',
  formRateLimit,
  async (req, res) => {
    try {
      // Validate request body
      const {
        form_type,
        rating,
        feedback_text,
        user_email,
        user_company,
        allow_followup,
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

      // If Supabase is not configured, log and return success
      if (!supabase) {
        logger.warn('Supabase not configured, logging feedback to console', {
          form_type,
          rating,
          user_email,
          user_company,
        })

        return res.status(200).json({
          success: true,
          message: 'Feedback received (Supabase not configured)',
        })
      }

      // Save feedback to Supabase
      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            form_type,
            rating,
            feedback_text: feedback_text || null,
            user_email: user_email || null,
            user_company: user_company || null,
            allow_followup: allow_followup || false,
            created_at: new Date().toISOString(),
          },
        ])

      if (error) {
        logger.error('Failed to save feedback to Supabase', {
          error: error.message,
          feedback: { form_type, rating },
        })

        // Still return success to user to avoid blocking them
        // The feedback was at least received by the backend
        return res.status(200).json({
          success: true,
          message: 'Feedback received',
        })
      }

      logger.info('Feedback saved successfully', {
        form_type,
        rating,
        user_email,
      })

      return res.status(200).json({
        success: true,
        message: 'Feedback saved successfully',
        data,
      })
    } catch (error) {
      logger.error('Error processing feedback request', {
        error: error.message,
        stack: error.stack,
      })

      return res.status(500).json({
        success: false,
        message: 'Failed to process feedback',
        errors: [error.message],
      })
    }
  }
)

module.exports = router
