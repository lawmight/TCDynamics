/**
 * PII Hashing Utility
 * Hashes personally identifiable information (PII) for secure logging
 * Uses SHA-256 with optional salt for additional security
 */

import crypto from 'crypto'

const PII_HASH_SALT = process.env.PII_HASH_SALT || ''

/**
 * Hash PII value using SHA-256
 * @param {string} value - PII value to hash (e.g., clerkId, userId, orgId)
 * @param {string} salt - Optional salt (defaults to PII_HASH_SALT env var)
 * @returns {string} Hex-encoded hash
 */
export function hashPii(value, salt = PII_HASH_SALT) {
  if (!value || typeof value !== 'string') {
    return null
  }

  return crypto
    .createHash('sha256')
    .update(`${salt}:${value}`)
    .digest('hex')
}
