/**
 * Supabase Auth Verification Utility
 * Verifies JWT tokens in Vercel serverless functions
 */

import { getSupabaseClient } from './supabase.js'

/**
 * Verify Supabase auth token and return user ID
 * @param {string} authHeader - Authorization header (Bearer token)
 * @returns {Promise<{userId: string | null, error: string | null}>}
 */
export async function verifySupabaseAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, error: 'Missing or invalid Authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = getSupabaseClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { userId: null, error: error?.message || 'Invalid token' }
    }

    return { userId: user.id, error: null }
  } catch (err) {
    return { userId: null, error: err.message }
  }
}

export default {
  verifySupabaseAuth,
}






