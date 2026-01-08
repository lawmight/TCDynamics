/**
 * Tenant API Key Authentication Utility
 * Verifies API keys for n8n/internal tools
 */

import bcrypt from 'bcryptjs'
import { ApiKey } from './models/ApiKey.js'
import { User } from './models/User.js'
import { connectToDatabase } from './mongodb.js'

/**
 * Verify tenant API key and return clerkId
 * @param {string} apiKey - API key from X-API-Key header
 * @returns {Promise<{clerkId: string | null, error: string | null}>}
 */
export async function verifyTenantApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('tc_live_')) {
    return { clerkId: null, error: 'Invalid API key format' }
  }

  await connectToDatabase()

  try {
    // Find active (non-revoked) API keys
    const keys = await ApiKey.find({ revokedAt: null }).select(
      '_id clerkId keyHash'
    )

    // Verify hash against provided key
    for (const keyRecord of keys || []) {
      const isValid = await bcrypt.compare(apiKey, keyRecord.keyHash)
      if (isValid) {
        // Update last_used_at asynchronously (don't wait)
        ApiKey.findByIdAndUpdate(keyRecord._id, {
          $set: { lastUsedAt: new Date() },
        })
          .then(() => {})
          .catch(err => console.warn('Failed to update lastUsedAt', err))

        return { clerkId: keyRecord.clerkId, error: null }
      }
    }

    return { clerkId: null, error: 'Invalid API key' }
  } catch (err) {
    console.error('Exception verifying API key', err)
    return { clerkId: null, error: err.message }
  }
}

/**
 * Get user entitlements (plan + subscription status)
 * @param {string} clerkId - Clerk user ID
 * @returns {Promise<{plan: string | null, subscriptionStatus: string | null, error: string | null}>}
 */
export async function getUserEntitlements(clerkId) {
  if (!clerkId) {
    return { plan: null, subscriptionStatus: null, error: 'Missing clerkId' }
  }

  await connectToDatabase()

  try {
    const user = await User.findOne({ clerkId }).select(
      'plan subscriptionStatus'
    )

    if (!user) {
      return { plan: null, subscriptionStatus: null, error: 'User not found' }
    }

    return {
      plan: user.plan || null,
      subscriptionStatus: user.subscriptionStatus || null,
      error: null,
    }
  } catch (err) {
    console.error('Exception fetching user entitlements', err)
    return { plan: null, subscriptionStatus: null, error: err.message }
  }
}

// Backward compatibility alias
export const getOrgEntitlements = getUserEntitlements

export default {
  verifyTenantApiKey,
  getUserEntitlements,
  getOrgEntitlements,
}
