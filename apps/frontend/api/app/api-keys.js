/**
 * Vercel Serverless Function for Tenant API Key Management
 * Allows authenticated users to create, list, and revoke API keys
 */

import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { verifyClerkAuth } from '../_lib/auth.js'
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
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: authError || 'Invalid token',
    })
  }

  await connectToDatabase()

  // GET - List API keys (prefixes only, never full keys)
  if (req.method === 'GET') {
    try {
      const keys = await ApiKey.find({
        clerkId,
        revokedAt: null,
      })
        .sort({ createdAt: -1 })
        .select('_id keyPrefix createdAt revokedAt lastUsedAt')

      const data = keys.map(key => ({
        id: key._id.toString(),
        key_prefix: key.keyPrefix,
        created_at: key.createdAt,
        revoked_at: key.revokedAt,
        last_used_at: key.lastUsedAt,
      }))

      return res.json({
        success: true,
        keys: data,
      })
    } catch (err) {
      console.error('Exception listing API keys', err)
      return res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  // POST - Create new API key
  if (req.method === 'POST') {
    try {
      // Generate new API key
      const apiKey = generateApiKey()
      const keyHash = await bcrypt.hash(apiKey, 10)
      const keyPrefix = apiKey.substring(0, 20) + '...' // For display

      const newKey = await ApiKey.create({
        clerkId,
        keyHash,
        keyPrefix,
      })

      console.log('API key created', { clerkId, keyId: newKey._id.toString() })

      // Return plaintext key ONCE (frontend must store securely)
      return res.json({
        success: true,
        id: newKey._id.toString(),
        key: apiKey, // Only returned on creation
        key_prefix: newKey.keyPrefix,
        created_at: newKey.createdAt,
      })
    } catch (err) {
      console.error('Exception creating API key', err)
      return res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  // DELETE - Revoke API key
  if (req.method === 'DELETE') {
    try {
      const { keyId } = req.body || {}

      if (!keyId) {
        return res.status(400).json({
          success: false,
          error: 'keyId is required',
        })
      }

      const result = await ApiKey.findOneAndUpdate(
        { _id: keyId, clerkId }, // Ensure user owns the key
        { $set: { revokedAt: new Date() } },
        { new: true }
      )

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'API key not found or access denied',
        })
      }

      console.log('API key revoked', { clerkId, keyId })

      return res.json({
        success: true,
        message: 'API key revoked',
      })
    } catch (err) {
      console.error('Exception revoking API key', err)
      return res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
    allowedMethods: ['GET', 'POST', 'DELETE'],
  })
}

export default allowCors(handler)
