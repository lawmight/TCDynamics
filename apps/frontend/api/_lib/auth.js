/**
 * Clerk Auth Verification Utility
 * Verifies JWT tokens in Vercel serverless functions
 */

import { verifyToken } from '@clerk/backend'

/**
 * Verify Clerk auth token and return user ID
 * @param {string} authHeader - Authorization header (Bearer token)
 * @returns {Promise<{userId: string | null, error: string | null}>}
 */
export async function verifyClerkAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, error: 'Missing or invalid Authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })

    // payload.sub contains the Clerk user ID
    return { userId: payload.sub, error: null }
  } catch (err) {
    return { userId: null, error: err.message }
  }
}

// Keep verifySupabaseAuth for backward compatibility during migration
// Can be removed after all routes are updated
export async function verifySupabaseAuth(authHeader) {
  // Delegate to Clerk auth
  return verifyClerkAuth(authHeader)
}

export default {
  verifyClerkAuth,
  verifySupabaseAuth,
}












