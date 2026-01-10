/**
 * Tenant API Key Authentication Utility
 * Verifies API keys for n8n/internal tools
 */

import bcrypt from 'bcryptjs'
import { logger } from './logger.js'
import { ApiKey } from './models/ApiKey.js'
import { User } from './models/User.js'
import { connectToDatabase } from './mongodb.js'

/**
 * Verify tenant API key and return clerkId
 *
 * Performance Optimization Strategy:
 * 1. Pre-filter by keyPrefix: Extract first 20 chars from input API key and match
 *    against stored keyPrefix field. This dramatically reduces the number of keys
 *    that need bcrypt comparison. Index on { revokedAt: 1, keyPrefix: 1 } optimizes this.
 * 2. Filter by revokedAt: Only check active (non-revoked) keys.
 * 3. Bcrypt comparison loop: Still necessary because MongoDB cannot index bcrypt hashes
 *    for direct lookup. The pre-filtering reduces this to typically 0-1 keys per request.
 *
 * API Key Format: Changed from strict `tc_live_` prefix check to `tc_` prefix
 * to support backward compatibility with existing keys and allow for future
 * key variants (e.g., `tc_test_`, `tc_dev_`).
 *
 * Key Prefix Format: Stored as first 20 chars of API key + '...' (e.g., 'tc_live_1234567890ab...')
 * This allows fast prefix matching before expensive bcrypt comparison.
 *
 * @param {string} apiKey - API key from X-API-Key header
 * @returns {Promise<{clerkId: string | null, error: string | null}>}
 */
export async function verifyTenantApiKey(apiKey) {
  // Intentional: Changed from strict 'tc_live_' prefix to 'tc_' prefix
  // This allows backward compatibility with existing keys and supports
  // future key variants (e.g., 'tc_test_', 'tc_dev_', 'tc_live_')
  if (!apiKey || !apiKey.startsWith('tc_')) {
    return { clerkId: null, error: 'Invalid API key format' }
  }

  await connectToDatabase()

  try {
    // Extract first 20 chars to match against keyPrefix field
    // keyPrefix is stored as first 20 chars + '...' (e.g., 'tc_live_1234567890ab...')
    const keyPrefixMatch = apiKey.substring(0, 20) + '...'

    // Pre-filter by keyPrefix and revokedAt status
    // This uses the compound index { revokedAt: 1, keyPrefix: 1 } for optimal performance
    // Most requests will match 0-1 keys, dramatically reducing bcrypt comparisons
    const keys = await ApiKey.find({
      revokedAt: null,
      keyPrefix: keyPrefixMatch,
    }).select('_id clerkId keyHash')

    // Verify hash against provided key
    // Note: bcrypt comparison must happen in application code (can't be indexed)
    // With keyPrefix pre-filtering, this loop typically processes 0-1 keys
    for (const keyRecord of keys || []) {
      const isValid = await bcrypt.compare(apiKey, keyRecord.keyHash)
      if (isValid) {
        // Update last_used_at asynchronously (don't wait)
        ApiKey.findByIdAndUpdate(keyRecord._id, {
          $set: { lastUsedAt: new Date() },
        })
          .then(() => {})
          .catch(err => logger.warn('Failed to update lastUsedAt', err))

        return { clerkId: keyRecord.clerkId, error: null }
      }
    }

    return { clerkId: null, error: 'Invalid API key' }
  } catch (err) {
    logger.error('Exception verifying API key', err)
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
    logger.error('Exception fetching user entitlements', err)
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
