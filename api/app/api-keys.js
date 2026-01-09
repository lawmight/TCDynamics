/**
 * Vercel Serverless Function for Tenant API Key Management
 * Allows authenticated users to create, list, and revoke API keys
 */

import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { verifyClerkAuth } from '../_lib/auth.js'
import { createErrorResponse } from '../_lib/error-handler.js'
import { logger } from '../_lib/logger.js'
import { ApiKey } from '../_lib/models/ApiKey.js'
import { connectToDatabase } from '../_lib/mongodb.js'

/**
 * Generate a new API key with tc_live_ prefix
 * @returns {string} API key in format tc_live_<64 hex chars>
 */
function generateApiKey() {
  const random = crypto.randomBytes(32).toString('hex')
  return `tc_live_${random}`
}

// Enable CORS
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return await fn(req, res)
}

const handler = async (req, res) => {
  // Verify Clerk authentication
  const authHeader = req.headers.authorization
  const { userId: clerkId, error: authError } =
    await verifyClerkAuth(authHeader)

  if (authError || !clerkId) {
    const { statusCode, response } = createErrorResponse(
      authError || 'Authentication required',
      401
    )
    return res.status(statusCode).json(response)
  }

  // Connect to database with error handling
  try {
    await connectToDatabase()
  } catch (dbError) {
    logger.error('Database connection failed', dbError)
    const { statusCode, response } = createErrorResponse(
      'Database connection failed. Please try again later.',
      503
    )
    return res.status(statusCode).json(response)
  }

  // GET - List API keys (prefixes only, never full keys)
  if (req.method === 'GET') {
    try {
      const keys = await ApiKey.find({
        clerkId,
        revokedAt: null,
      })
        .sort({ createdAt: -1 })
        .select('_id keyPrefix name createdAt revokedAt lastUsedAt')

      const data = keys.map(key => ({
        id: key._id.toString(),
        key_prefix: key.keyPrefix,
        name: key.name || null,
        created_at: key.createdAt,
        revoked_at: key.revokedAt,
        last_used_at: key.lastUsedAt,
      }))

      return res.json({
        success: true,
        keys: data,
      })
    } catch (err) {
      const { statusCode, response } = createErrorResponse(
        'Exception listing API keys',
        500,
        err
      )
      return res.status(statusCode).json(response)
    }
  }

  // POST - Create new API key
  if (req.method === 'POST') {
    try {
      const { name } = req.body || {}

      // Validate API key name
      if (name !== undefined && name !== null) {
        if (typeof name !== 'string') {
          const { statusCode, response } = createErrorResponse(
            'API key name must be a string',
            400
          )
          return res.status(statusCode).json(response)
        }

        const trimmedName = name.trim()

        // Length validation: 1-100 characters
        if (trimmedName.length === 0) {
          const { statusCode, response } = createErrorResponse(
            'API key name cannot be empty',
            400
          )
          return res.status(statusCode).json(response)
        }

        if (trimmedName.length > 100) {
          const { statusCode, response } = createErrorResponse(
            'API key name must be 100 characters or less',
            400
          )
          return res.status(statusCode).json(response)
        }

        // Pattern validation: alphanumeric, spaces, hyphens, underscores only
        const namePattern = /^[a-zA-Z0-9\s\-_]+$/
        if (!namePattern.test(trimmedName)) {
          const { statusCode, response } = createErrorResponse(
            'API key name can only contain letters, numbers, spaces, hyphens, and underscores',
            400
          )
          return res.status(statusCode).json(response)
        }

        // Remove control characters
        const sanitizedName = trimmedName.replace(/[\x00-\x1F\x7F]/g, '')
        if (sanitizedName !== trimmedName) {
          const { statusCode, response } = createErrorResponse(
            'API key name contains invalid characters',
            400
          )
          return res.status(statusCode).json(response)
        }
      }

      // Generate new API key
      const apiKey = generateApiKey()
      const keyHash = await bcrypt.hash(apiKey, 10)
      const keyPrefix = apiKey.substring(0, 20) + '...' // For display

      const newKey = await ApiKey.create({
        clerkId,
        keyHash,
        keyPrefix,
        name: name?.trim() || null,
      })

      logger.info('API key created', {
        clerkId,
        keyId: newKey._id.toString(),
      })

      // Return plaintext key ONCE (frontend must store securely)
      return res.json({
        success: true,
        id: newKey._id.toString(),
        key: apiKey, // Only returned on creation
        key_prefix: newKey.keyPrefix,
        created_at: newKey.createdAt,
      })
    } catch (err) {
      const { statusCode, response } = createErrorResponse(
        'Exception creating API key',
        500,
        err
      )
      return res.status(statusCode).json(response)
    }
  }

  // DELETE - Revoke API key
  if (req.method === 'DELETE') {
    try {
      const { keyId } = req.body || {}

      if (!keyId) {
        const { statusCode, response } = createErrorResponse(
          'keyId is required',
          400
        )
        return res.status(statusCode).json(response)
      }

      const result = await ApiKey.findOneAndUpdate(
        { _id: keyId, clerkId }, // Ensure user owns the key
        { $set: { revokedAt: new Date() } },
        { new: true }
      )

      if (!result) {
        const { statusCode, response } = createErrorResponse(
          'API key not found or access denied',
          404
        )
        return res.status(statusCode).json(response)
      }

      logger.info('API key revoked', { clerkId, keyId })

      return res.json({
        success: true,
        message: 'API key revoked',
      })
    } catch (err) {
      const { statusCode, response } = createErrorResponse(
        'Exception revoking API key',
        500,
        err
      )
      return res.status(statusCode).json(response)
    }
  }

  // Method not allowed
  const { statusCode, response } = createErrorResponse(
    'Method not allowed',
    405
  )
  response.allowedMethods = ['GET', 'POST', 'DELETE']
  return res.status(statusCode).json(response)
}

export default allowCors(handler)
