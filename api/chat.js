import crypto from 'crypto'
import { saveConversation } from './_lib/mongodb-db.js'
import { generateSystemPrompt, getPromptMetadata } from './_lib/prompt-generator.js'

// Disable Vercel's automatic body parsing - we'll handle it manually
export const config = {
  api: {
    bodyParser: false,
  },
}

// ---------- Configuration & Guards ----------
const ALLOW_VERCEL_CHAT = process.env.ALLOW_VERCEL_CHAT === 'true'
const INTERNAL_CHAT_TOKEN = process.env.INTERNAL_CHAT_TOKEN
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ||
  process.env.FRONTEND_URL ||
  'https://tcdynamics.fr'
const ENABLE_CLIENT_IP_LOGGING = process.env.ENABLE_CLIENT_IP_LOGGING === 'true'
const IP_HASH_SALT = process.env.IP_HASH_SALT || ''
const MAX_MESSAGE_LENGTH = Math.max(
  1,
  Number(process.env.MAX_MESSAGE_LENGTH) || 2000
)
const MAX_TOKENS = Math.max(1, Number(process.env.MAX_TOKENS) || 512)
const MAX_REQUESTS_PER_WINDOW = 5
const RATE_LIMIT_WINDOW_MS = 60_000
// Simple in-memory rate limiter; replace with a persistent store (e.g., Vercel KV / Upstash Redis) in production to share state across invocations
const rateLimitStore = new Map()

function isRateLimited(key) {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const existingHistory = rateLimitStore.get(key) || []
  const filteredHistory = existingHistory.filter(ts => ts > cutoff)

  // Compute whether adding this request would exceed the limit
  const wouldExceedLimit = filteredHistory.length >= MAX_REQUESTS_PER_WINDOW

  if (wouldExceedLimit) {
    // Request is rate-limited: update store with filtered history (evict old entries)
    // but do NOT add the current timestamp
    rateLimitStore.set(key, filteredHistory)
    return true
  }

  // Request is allowed: add current timestamp and persist
  const updatedHistory = [...filteredHistory, now]
  rateLimitStore.set(key, updatedHistory)
  return false
}

// Helper to parse request body manually
async function getRequestBody(req) {
  const MAX_BODY_SIZE = 10 * 1024 // 10KB - plenty for chat messages
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
      if (body.length > MAX_BODY_SIZE) {
        req.destroy()
        reject(new Error('Request body too large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (e) {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (Array.isArray(xff)) return xff[0]
  if (typeof xff === 'string') return xff.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

function isOriginAllowed(req) {
  const origin = req.headers.origin || req.headers.referer
  if (!origin) return false
  try {
    return new URL(origin).origin === new URL(ALLOWED_ORIGIN).origin
  } catch {
    return false
  }
}

function hashClientIp(clientIp) {
  if (!ENABLE_CLIENT_IP_LOGGING) return null
  if (!IP_HASH_SALT || !clientIp || clientIp === 'unknown') {
    console.warn(
      'IP logging enabled but IP_HASH_SALT or client IP missing; skipping IP storage'
    )
    return null
  }
  return crypto
    .createHash('sha256')
    .update(`${IP_HASH_SALT}:${clientIp}`)
    .digest('hex')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Route is internal-only unless explicitly enabled
  if (!ALLOW_VERCEL_CHAT) {
    return res.status(403).json({
      error: 'Chat route disabled on this edge. Use Azure Functions endpoint.',
    })
  }

  if (!isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Origin not allowed' })
  }

  // Optional internal token for extra safety
  if (INTERNAL_CHAT_TOKEN) {
    const provided =
      req.headers['x-internal-token'] ||
      (req.headers.authorization || '').replace('Bearer ', '')
    if (provided !== INTERNAL_CHAT_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  // Rate limit by client IP
  const clientIp = getClientIp(req)
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please slow down.',
    })
  }

  try {
    // Get body - either from req.body (if Vercel parsed it) or parse manually
    let body
    try {
      body =
        req.body && typeof req.body === 'object'
          ? req.body
          : typeof req.body === 'string'
            ? JSON.parse(req.body)
            : await getRequestBody(req)
    } catch (parseError) {
      console.warn('Invalid JSON body received', parseError)
      return res.status(400).json({ error: 'Invalid JSON' })
    }

    const { message, sessionId, userEmail, maxTokens } = body
    const conversationId =
      sessionId ||
      `chat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message requis' })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message trop long (max ${MAX_MESSAGE_LENGTH} caractères)`,
      })
    }

    // Check if OpenAI is configured
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return res.status(503).json({ error: 'Service IA non configuré' })
    }

    const cappedMaxTokens =
      typeof maxTokens === 'number'
        ? Math.max(1, Math.min(MAX_TOKENS, maxTokens))
        : MAX_TOKENS

    // Generate system prompt using centralized prompt generator
    const systemPrompt = generateSystemPrompt({ type: 'chat', language: 'fr' })

    // Call OpenAI (keep lightweight for internal/testing)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: cappedMaxTokens,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse =
      data.choices?.[0]?.message?.content ||
      "Désolé, je n'ai pas pu générer une réponse."
    const tokensUsed = data.usage?.total_tokens || 0
    const clientIpHash = hashClientIp(clientIp)

    // Save conversation to MongoDB (best-effort)
    try {
      // IP logging is optional (ENABLE_CLIENT_IP_LOGGING + IP_HASH_SALT)
      const promptMetadata = getPromptMetadata({ type: 'chat', language: 'fr' })
      const metadata = {
        model: 'gpt-3.5-turbo',
        tokens_used: tokensUsed,
        temperature: 0.7,
        source: 'vercel-chat',
        origin: ALLOWED_ORIGIN,
        prompt: promptMetadata,
      }
      if (clientIpHash) {
        metadata.clientIpHash = clientIpHash
      }

      await saveConversation({
        sessionId: conversationId,
        userMessage: message,
        aiResponse,
        userEmail: userEmail || null,
        metadata,
      })
    } catch (logError) {
      console.warn('Conversation log failed', logError)
    }

    res.status(200).json({
      success: true,
      response: aiResponse,
      conversationId,
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    res.status(500).json({
      error: 'Erreur du service IA',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
