/**
 * Vercel Serverless Function for Tenant API Key Management
 * Allows authenticated users to create, list, and revoke API keys
 */

import { getSupabaseClient } from '../_lib/supabase.js'
import { verifySupabaseAuth } from '../_lib/auth.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

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
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,POST,DELETE'
  )
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
  // Verify Supabase authentication
  const authHeader = req.headers.authorization
  const { userId: orgId, error: authError } =
    await verifySupabaseAuth(authHeader)

  if (authError || !orgId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: authError || 'Invalid token',
    })
  }

  const supabase = getSupabaseClient()

  // GET - List API keys (prefixes only, never full keys)
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, key_prefix, created_at, revoked_at, last_used_at')
        .eq('org_id', orgId)
        .is('revoked_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error listing API keys', error)
        return res.status(500).json({
          success: false,
          error: error.message,
        })
      }

      return res.json({
        success: true,
        keys: data || [],
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

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          org_id: orgId,
          key_hash: keyHash,
          key_prefix: keyPrefix,
        })
        .select('id, key_prefix, created_at')
        .single()

      if (error) {
        console.error('Error creating API key', error)
        return res.status(500).json({
          success: false,
          error: error.message,
        })
      }

      console.log('API key created', { orgId, keyId: data.id })

      // Return plaintext key ONCE (frontend must store securely)
      return res.json({
        success: true,
        id: data.id,
        key: apiKey, // Only returned on creation
        key_prefix: data.key_prefix,
        created_at: data.created_at,
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

      const { error } = await supabase
        .from('api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', keyId)
        .eq('org_id', orgId) // Ensure user owns the key

      if (error) {
        console.error('Error revoking API key', error)
        return res.status(500).json({
          success: false,
          error: error.message,
        })
      }

      console.log('API key revoked', { orgId, keyId })

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






