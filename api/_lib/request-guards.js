import { randomUUID } from 'crypto'
import { LRUCache } from 'lru-cache'

const DEFAULT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const DEFAULT_MAX_BYTES = 64 * 1024 // 64 KB

const rateLimiter = new LRUCache({
  max: 5000,
  ttl: DEFAULT_WINDOW_MS,
  updateAgeOnGet: true,
})

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    const v = forwarded[0]
    return typeof v === 'string' ? v.trim() : String(v)
  }
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return (
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

function ensureRequestId(req, res) {
  const header = req.headers['x-request-id']
  const requestId = Array.isArray(header) ? header[0] : header
  const id = requestId || randomUUID()
  res.setHeader('x-request-id', id)
  req.requestId = id
  return id
}

export async function parseJsonBody(req, { maxBytes = DEFAULT_MAX_BYTES } = {}) {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body)
  }

  return new Promise((resolve, reject) => {
    let body = ''
    let total = 0

    req.on('data', chunk => {
      total += chunk.length
      if (total > maxBytes) {
        reject(new Error('PayloadTooLarge'))
        req.destroy()
        return
      }
      body += chunk.toString()
    })

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('InvalidJSON'))
      }
    })

    req.on('error', reject)
  })
}

export function validateAllowedFields(body, allowedFields = []) {
  const keys = Object.keys(body || {})
  const unknown = keys.filter(key => !allowedFields.includes(key))
  return {
    valid: unknown.length === 0,
    unknown,
  }
}

export function applyRateLimit(req, { limit = 10, windowMs = DEFAULT_WINDOW_MS, scope = 'api' } = {}) {
  const client = getClientIp(req)
  const key = `${scope}:${client}`
  const current = rateLimiter.get(key) || { count: 0 }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfter: windowMs / 1000,
    }
  }

  const next = {
    count: current.count + 1,
  }

  rateLimiter.set(key, next, { ttl: windowMs })

  return { allowed: true }
}

async function verifyTurnstile(token, remoteip, secret) {
  const params = new URLSearchParams()
  params.append('secret', secret)
  params.append('response', token)
  if (remoteip) params.append('remoteip', remoteip)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: params,
  })

  const data = await response.json()
  if (data?.success) {
    return { ok: true }
  }

  return { ok: false, status: 400, message: 'Captcha validation failed' }
}

async function verifyHCaptcha(token, remoteip, secret) {
  const params = new URLSearchParams()
  params.append('secret', secret)
  params.append('response', token)
  if (remoteip) params.append('remoteip', remoteip)

  const response = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    body: params,
  })

  const data = await response.json()
  if (data?.success) {
    return { ok: true }
  }

  return { ok: false, status: 400, message: 'Captcha validation failed' }
}

async function verifyCaptcha(token, remoteip) {
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET
  const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY || process.env.HCAPTCHA_SECRET

  if (!turnstileSecret && !hcaptchaSecret) {
    console.warn('[Captcha] No captcha secret configured - skipping verification')
    return { ok: true, skipped: true }
  }

  if (!token) {
    return { ok: false, status: 400, message: 'Captcha token required' }
  }

  if (turnstileSecret) {
    return verifyTurnstile(token, remoteip, turnstileSecret)
  }

  return verifyHCaptcha(token, remoteip, hcaptchaSecret)
}

export function withGuards(handler, options = {}) {
  const {
    allowedMethods = ['POST'],
    allowedFields = [],
    requireCaptcha = false,
    rateLimit: rateLimitOptions,
    maxBodyBytes = DEFAULT_MAX_BYTES,
  } = options

  return async (req, res) => {
    try {
      const requestId = ensureRequestId(req, res)

      if (req.method === 'OPTIONS') {
        res.setHeader('Allow', allowedMethods.join(','))
        return res.status(204).end()
      }

      if (!allowedMethods.includes(req.method)) {
        return res
          .status(405)
          .json({ error: 'Method not allowed', requestId })
      }

      const rateResult = applyRateLimit(req, rateLimitOptions)
      if (!rateResult.allowed) {
        if (rateResult.retryAfter) {
          res.setHeader('Retry-After', rateResult.retryAfter.toString())
        }
        return res
          .status(429)
          .json({
            error: 'Rate limit exceeded',
            retryAfterSeconds: rateResult.retryAfter,
            requestId,
          })
      }

      const body = await parseJsonBody(req, { maxBytes: maxBodyBytes })

      if (allowedFields.length > 0) {
        const validation = validateAllowedFields(body, allowedFields)
        if (!validation.valid) {
          return res.status(400).json({
            error: 'Unknown fields provided',
            fields: validation.unknown,
            requestId,
          })
        }
      }

      if (requireCaptcha) {
        const captchaToken = body?.captchaToken || req.headers['x-captcha-token']
        const captchaResult = await verifyCaptcha(captchaToken, getClientIp(req))
        if (!captchaResult.ok) {
          return res
            .status(captchaResult.status)
            .json({ error: captchaResult.message, requestId })
        }
      }

      return handler(req, res, body)
    } catch (error) {
      if (error?.message === 'PayloadTooLarge') {
        return res.status(413).json({ error: 'Payload too large', requestId: req.requestId })
      }
      if (error?.message === 'InvalidJSON') {
        return res.status(400).json({ error: 'Invalid JSON payload', requestId: req.requestId })
      }
      console.error('Handler failure', error)
      return res.status(500).json({
        error: 'Internal server error',
        requestId: req.requestId,
      })
    }
  }
}

export default {
  applyRateLimit,
  getClientIp,
  parseJsonBody,
  validateAllowedFields,
  withGuards,
}

