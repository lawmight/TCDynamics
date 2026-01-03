/**
 * Tenant API Key Authentication Utility
 * Verifies API keys for n8n/internal tools
 */

import bcrypt from 'bcryptjs'
import { getSupabaseClient } from './supabase.js'

/**
 * Verify tenant API key and return org_id
 * @param {string} apiKey - API key from X-API-Key header
 * @returns {Promise<{orgId: string | null, error: string | null}>}
 */
export async function verifyTenantApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('tc_live_')) {
    return { orgId: null, error: 'Invalid API key format' }
  }

  const supabase = getSupabaseClient()

  try {
    // Find active (non-revoked) API keys
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, org_id, key_hash')
      .is('revoked_at', null)

    if (error) {
      console.error('Error fetching API keys', error)
      return { orgId: null, error: error.message }
    }

    // Verify hash against provided key
    for (const keyRecord of keys || []) {
      const isValid = await bcrypt.compare(apiKey, keyRecord.key_hash)
      if (isValid) {
        // Update last_used_at asynchronously (don't wait)
        supabase
          .from('api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', keyRecord.id)
          .then(() => {})
          .catch(err => console.warn('Failed to update last_used_at', err))

        return { orgId: keyRecord.org_id, error: null }
      }
    }

    return { orgId: null, error: 'Invalid API key' }
  } catch (err) {
    console.error('Exception verifying API key', err)
    return { orgId: null, error: err.message }
  }
}

/**
 * Get org entitlements (plan + subscription status)
 * @param {string} orgId - Org ID
 * @returns {Promise<{plan: string | null, subscriptionStatus: string | null, error: string | null}>}
 */
export async function getOrgEntitlements(orgId) {
  if (!orgId) {
    return { plan: null, subscriptionStatus: null, error: 'Missing org_id' }
  }

  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('orgs')
      .select('plan, subscription_status')
      .eq('id', orgId)
      .single()

    if (error) {
      console.error('Error fetching org entitlements', error)
      return { plan: null, subscriptionStatus: null, error: error.message }
    }

    return {
      plan: data?.plan || null,
      subscriptionStatus: data?.subscription_status || null,
      error: null,
    }
  } catch (err) {
    console.error('Exception fetching org entitlements', err)
    return { plan: null, subscriptionStatus: null, error: err.message }
  }
}

export default {
  verifyTenantApiKey,
  getOrgEntitlements,
}
