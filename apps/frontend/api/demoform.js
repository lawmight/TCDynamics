/**
 * Demo Request Form API Endpoint
 *
 * Vercel Serverless Function to handle demo request form submissions.
 * Stores submissions in Supabase and sends email notifications via Resend.
 *
 * @module api/demoform
 */

import { insertDemoRequest } from './utils/supabase.js';
import { sendDemoRequestEmail } from './utils/resend.js';

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
 * Validate demo request data
 *
 * @param {Object} data - Form data to validate
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
function validateDemoData(data) {
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

  if (!data.company || typeof data.company !== 'string' || data.company.trim().length < 2) {
    errors.push('Company is required and must be at least 2 characters');
  }

  // Optional field type validations
  if (data.phone && typeof data.phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (data.jobTitle && typeof data.jobTitle !== 'string') {
    errors.push('Job title must be a string');
  }

  if (data.companySize && typeof data.companySize !== 'string') {
    errors.push('Company size must be a string');
  }

  if (data.industry && typeof data.industry !== 'string') {
    errors.push('Industry must be a string');
  }

  if (data.useCase && typeof data.useCase !== 'string') {
    errors.push('Use case must be a string');
  }

  if (data.timeline && typeof data.timeline !== 'string') {
    errors.push('Timeline must be a string');
  }

  if (data.message && typeof data.message !== 'string') {
    errors.push('Message must be a string');
  }

  if (data.preferredDate && typeof data.preferredDate !== 'string') {
    errors.push('Preferred date must be a string');
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
    const demoData = req.body;

    console.log('Received demo request submission:', {
      name: demoData.name,
      email: demoData.email,
      company: demoData.company,
    });

    // Validate input
    const validation = validateDemoData(demoData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Sanitize and prepare data
    const sanitizedData = {
      name: demoData.name.trim(),
      email: demoData.email.trim().toLowerCase(),
      company: demoData.company.trim(),
      phone: demoData.phone?.trim() || null,
      jobTitle: demoData.jobTitle?.trim() || null,
      companySize: demoData.companySize?.trim() || null,
      industry: demoData.industry?.trim() || null,
      useCase: demoData.useCase?.trim() || null,
      timeline: demoData.timeline?.trim() || null,
      message: demoData.message?.trim() || null,
      preferredDate: demoData.preferredDate?.trim() || null,
    };

    // Store in Supabase
    let dbRecord;
    try {
      dbRecord = await insertDemoRequest(sanitizedData);
      console.log('Demo request stored in Supabase:', dbRecord.id);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB fails - we'll still try to send email
    }

    // Send email notification
    let emailResult;
    try {
      emailResult = await sendDemoRequestEmail(sanitizedData);
      console.log('Demo request email sent successfully:', emailResult.id);
    } catch (emailError) {
      console.error('Email error:', emailError);
      // If email fails but DB succeeded, still return success
      if (dbRecord) {
        return res.status(200).json({
          success: true,
          message: 'Demo request submitted successfully (email notification failed)',
          requestId: dbRecord.id,
          emailSent: false,
        });
      }
      // If both failed, return error
      throw emailError;
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Demo request submitted successfully',
      requestId: dbRecord?.id,
      emailSent: !!emailResult,
    });

  } catch (error) {
    console.error('Demo request error:', error);

    // Return appropriate error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process demo request. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
