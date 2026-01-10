/**
 * Vercel Serverless Function for API Key Restore (Undo Revocation)
 * Allows restoring a revoked API key within a time window
 */

import { verifyClerkAuth } from '../../../_lib/auth.js'
import { ApiKey } from '../../../_lib/models/ApiKey.js'
import { connectToDatabase } from '../../../_lib/mongodb.js'

// Restore window: 10 seconds
const RESTORE_WINDOW_MS = 10 * 1000

// Enable CORS
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
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
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['POST'],
    })
  }

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

  // Get key ID from URL path
  const { id: keyId } = req.query

  if (!keyId) {
    return res.status(400).json({
      success: false,
      error: 'Key ID is required',
    })
  }

  await connectToDatabase()

  try {
    // Find the key owned by this user
    const key = await ApiKey.findOne({ _id: keyId, clerkId })

    if (!key) {
      return res.status(404).json({
        success: false,
        error: 'API key not found or access denied',
      })
    }

    if (!key.revokedAt) {
      return res.status(400).json({
        success: false,
        error: 'API key is not revoked',
      })
    }

    // Check if within restore window
    const revokedAgo = Date.now() - key.revokedAt.getTime()
    if (revokedAgo > RESTORE_WINDOW_MS) {
      return res.status(400).json({
        success: false,
        error: 'Restore window expired',
        message: `Keys can only be restored within ${RESTORE_WINDOW_MS / 1000} seconds of revocation`,
      })
    }

    // Restore the key
    await ApiKey.findByIdAndUpdate(keyId, { $set: { revokedAt: null } })

    console.log('API key restored', { clerkId, keyId })

    return res.json({
      success: true,
      message: 'API key restored',
    })
  } catch (err) {
    console.error('Exception restoring API key', err)
    return res.status(500).json({
      success: false,
      error: err.message,
    })
  }
}

export default allowCors(handler)
