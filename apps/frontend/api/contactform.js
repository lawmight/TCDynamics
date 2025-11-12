/**
 * Contact Form API Endpoint
 *
 * Vercel Serverless Function to handle contact form submissions.
 * Stores submissions in Supabase and sends email notifications via Resend.
 *
 * @module api/contactform
 */

import { insertContact } from './utils/supabase.js';
import { sendContactFormEmail } from './utils/resend.js';

/**
 * Handle CORS headers
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

/**
 * Validate contact form data
 *
 * @param {Object} data - Form data to validate
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
function validateContactData(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email must be valid');
    }
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('Message is required and must be at least 10 characters');
  }

  // Optional field validations
  if (data.phone && typeof data.phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (data.company && typeof data.company !== 'string') {
    errors.push('Company must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Main handler function
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests',
    });
  }

  try {
    // Parse request body
    const contactData = req.body;

    console.log('Received contact form submission:', {
      name: contactData.name,
      email: contactData.email,
      hasMessage: !!contactData.message,
    });

    // Validate input
    const validation = validateContactData(contactData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Sanitize and prepare data
    const sanitizedData = {
      name: contactData.name.trim(),
      email: contactData.email.trim().toLowerCase(),
      company: contactData.company?.trim() || null,
      phone: contactData.phone?.trim() || null,
      message: contactData.message.trim(),
      source: 'website',
    };

    // Store in Supabase
    let dbRecord;
    try {
      dbRecord = await insertContact(sanitizedData);
      console.log('Contact stored in Supabase:', dbRecord.id);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB fails - we'll still try to send email
    }

    // Send email notification
    let emailResult;
    try {
      emailResult = await sendContactFormEmail(sanitizedData);
      console.log('Email sent successfully:', emailResult.id);
    } catch (emailError) {
      console.error('Email error:', emailError);
      // If email fails but DB succeeded, still return success
      if (dbRecord) {
        return res.status(200).json({
          success: true,
          message: 'Contact form submitted successfully (email notification failed)',
          contactId: dbRecord.id,
          emailSent: false,
        });
      }
      // If both failed, return error
      throw emailError;
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully',
      contactId: dbRecord?.id,
      emailSent: !!emailResult,
    });

  } catch (error) {
    console.error('Contact form error:', error);

    // Return appropriate error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process contact form submission. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
