import { URL } from 'node:url'

const BLOCKED_HOSTS = [
  '169.254.169.254',
  'metadata.google.internal',
  'localhost',
  '0.0.0.0',
  '[::1]',
]

const BLOCKED_PREFIXES = [
  '10.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
  '192.168.',
  '127.',
]

/**
 * Validate an external image URL for AI providers.
 * Allows HTTPS only and blocks local/private network targets.
 *
 * @param {unknown} urlString
 * @returns {{ valid: true, url: string } | { valid: false, error: string }}
 */
export function validateImageUrl(urlString) {
  if (typeof urlString !== 'string') {
    return { valid: false, error: 'URL must be a string' }
  }

  let parsed
  try {
    parsed = new URL(urlString)
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTPS URLs are allowed' }
  }

  const hostname = parsed.hostname.toLowerCase()
  if (BLOCKED_HOSTS.includes(hostname)) {
    return { valid: false, error: 'URL targets a blocked host' }
  }

  if (BLOCKED_PREFIXES.some(prefix => hostname.startsWith(prefix))) {
    return { valid: false, error: 'URL targets a blocked host' }
  }

  return { valid: true, url: parsed.href }
}
