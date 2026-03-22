/**
 * Clerk Auth Verification Utility
 * Verifies JWT tokens in Vercel serverless functions
 */

import { verifyToken } from '@clerk/backend'

const getClerkSecretKey = () =>
  process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY

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
      secretKey: getClerkSecretKey(),
    })

    // payload.sub contains the Clerk user ID
    return { userId: payload.sub, error: null }
  } catch (err) {
    console.error('[auth] Token verification failed:', err.message || err)
    return { userId: null, error: 'Invalid or expired token' }
  }
}

export default {
  verifyClerkAuth,
}












