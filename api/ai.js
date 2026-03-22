import crypto from 'crypto'
import { verifyClerkAuth } from './_lib/auth.js'
import { saveConversation } from './_lib/mongodb-db.js'
import { User } from './_lib/models/User.js'
import { connectToDatabase } from './_lib/mongodb.js'
import { getClientIp, parseJsonBody } from './_lib/request-guards.js'
import { withSentry } from './_lib/sentry.js'
import { validateImageUrl } from './_lib/validate-url.js'

/**
 * @security
 * Auth: Clerk JWT (`verifyClerkAuth`) required for all actions
 * Tenant isolation: `clerkId` resolved from JWT for user-level policy checks
 * Rate limit: IP-based limiter on OpenRouter chat (defense-in-depth)
 * Last audit: 2026-02-26 (Phase 4)
 */

// Disable Vercel's automatic body parsing - we'll handle it manually
export const config = {
  api: {
    bodyParser: false,
  },
}

// ---------- Configuration & Guards ----------
const ALLOW_VERCEL_CHAT = process.env.ALLOW_VERCEL_CHAT === 'true'
const INTERNAL_CHAT_TOKEN = process.env.INTERNAL_CHAT_TOKEN
const DEFAULT_ALLOWED_ORIGIN = 'https://tcdynamics.fr'
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ||
  process.env.FRONTEND_URL ||
  process.env.VITE_FRONTEND_URL ||
  DEFAULT_ALLOWED_ORIGIN
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

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_APP_TITLE = process.env.OPENROUTER_APP_TITLE || 'WorkFlowAI'

const CHAT_MAX_BODY_BYTES = 10 * 1024 // 10KB for chat messages
const VISION_MAX_BODY_BYTES = 256 * 1024 // 256KB for image URL requests

function getQueryValue(value) {
  if (Array.isArray(value)) return value[0]
  return value
}

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function getAllowedOrigins() {
  return new Set(
    [
      DEFAULT_ALLOWED_ORIGIN,
      process.env.ALLOWED_ORIGIN,
      process.env.FRONTEND_URL,
      process.env.VITE_FRONTEND_URL,
    ]
      .flatMap(value => (typeof value === 'string' ? value.split(',') : []))
      .map(value => normalizeOrigin(value.trim()))
      .filter(Boolean)
  )
}

const ALLOWED_ORIGINS = getAllowedOrigins()

function isLocalDevelopmentOrigin(origin) {
  if (process.env.NODE_ENV === 'production') return false
  try {
    const { hostname } = new URL(origin)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

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

function isOriginAllowed(req) {
  const origin = req.headers.origin || req.headers.referer
  if (!origin) return false
  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin) return false
  return (
    ALLOWED_ORIGINS.has(normalizedOrigin) ||
    isLocalDevelopmentOrigin(normalizedOrigin)
  )
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

function getMaxBodyBytes(action) {
  if (action === 'vision') return VISION_MAX_BODY_BYTES
  return CHAT_MAX_BODY_BYTES
}

async function parseBody(req, maxBytes) {
  try {
    return await parseJsonBody(req, { maxBytes })
  } catch (error) {
    if (error?.message === 'PayloadTooLarge') {
      return { error: { status: 413, message: 'Payload too large' } }
    }
    if (error?.message === 'InvalidJSON') {
      return { error: { status: 400, message: 'Invalid JSON' } }
    }
    return {
      error: {
        status: 400,
        message:
          error instanceof Error ? error.message : 'Invalid request body',
      },
    }
  }
}

function getLatestUserMessage(body) {
  if (typeof body?.message === 'string' && body.message.trim()) {
    return body.message
  }

  if (!Array.isArray(body?.messages)) {
    return null
  }

  for (let index = body.messages.length - 1; index >= 0; index -= 1) {
    const message = body.messages[index]
    if (
      message?.role === 'user' &&
      typeof message.content === 'string' &&
      message.content.trim()
    ) {
      return message.content
    }
  }

  return null
}

async function handleOpenRouterChat(req, res, body, clerkId) {
  if (!ALLOW_VERCEL_CHAT) {
    return res.status(403).json({
      error: 'Chat route disabled on this edge. Use Azure Functions endpoint.',
    })
  }

  if (!isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Origin not allowed' })
  }

  if (INTERNAL_CHAT_TOKEN) {
    const providedHeader = req.headers['x-internal-token']
    const providedInternalToken = Array.isArray(providedHeader)
      ? providedHeader[0]
      : providedHeader
    if (
      typeof providedInternalToken !== 'string' ||
      providedInternalToken !== INTERNAL_CHAT_TOKEN
    ) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const clientIp = getClientIp(req)
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please slow down.',
    })
  }

  const { sessionId, userEmail, maxTokens } = body || {}
  const message = getLatestUserMessage(body)
  const conversationId =
    sessionId || `chat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message requis' })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `Message trop long (max ${MAX_MESSAGE_LENGTH} caractères)`,
    })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    const setupHint =
      process.env.NODE_ENV !== 'production'
        ? "Definissez OPENROUTER_API_KEY dans votre environnement de dev (.env.local) puis redemarrez `npm run dev`."
        : undefined

    return res
      .status(503)
      .json({ error: 'Service IA non configuré', message: setupHint })
  }

  const cappedMaxTokens =
    typeof maxTokens === 'number'
      ? Math.max(1, Math.min(MAX_TOKENS, maxTokens))
      : MAX_TOKENS

  const openRouterModel = process.env.OPENROUTER_MODEL || 'openrouter/free'
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': ALLOWED_ORIGIN,
      'X-Title': OPENROUTER_APP_TITLE,
    },
    body: JSON.stringify({
      model: openRouterModel,
      messages: [
        {
          role: 'system',
          content:
            'Tu es WorkFlowAI, assistant IA pour TCDynamics (PME FR). Réponds en français, professionnel et concis.',
        },
        { role: 'user', content: message.trim() },
      ],
      max_tokens: cappedMaxTokens,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  const aiResponse =
    data.choices?.[0]?.message?.content ||
    "Désolé, je n'ai pas pu générer une réponse."
  const tokensUsed = data.usage?.total_tokens || 0
  const actualModel = data.model || openRouterModel
  const clientIpHash = hashClientIp(clientIp)

  try {
    const metadata = {
      model: actualModel,
      tokens_used: tokensUsed,
      temperature: 0.7,
      source: 'vercel-chat',
      origin: ALLOWED_ORIGIN,
      provider: 'openrouter',
    }
    if (clientIpHash) {
      metadata.clientIpHash = clientIpHash
    }

    await saveConversation({
      sessionId: conversationId,
      userMessage: message,
      aiResponse,
      userEmail: typeof userEmail === 'string' ? userEmail : null,
      metadata,
      clerkId,
    })
  } catch (logError) {
    console.warn('Conversation log failed', logError)
  }

  return res.status(200).json({
    success: true,
    response: aiResponse,
    message: aiResponse,
    conversationId,
  })
}

async function handleOpenRouterVision(req, res, body, clerkId) {
  await connectToDatabase()
  const user = await User.findOne({ clerkId })
  if (!user || !['professional', 'enterprise'].includes(user.plan)) {
    return res.status(403).json({
      error: 'Upgrade required',
      message: 'Vision analysis requires a Professional or Enterprise plan',
    })
  }

  const { imageUrl } = body || {}

  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return res.status(400).json({ error: "URL d'image requise" })
  }

  const urlCheck = validateImageUrl(imageUrl)
  if (!urlCheck.valid) {
    return res.status(400).json({ error: urlCheck.error })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'Service Vision non configuré' })
  }

  const visionModel = process.env.OPENROUTER_VISION_MODEL || 'openrouter/free'
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': ALLOWED_ORIGIN,
      'X-Title': OPENROUTER_APP_TITLE,
    },
    body: JSON.stringify({
      model: visionModel,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: "Analyze this image and describe what you see. If there's text, extract it. Provide a detailed caption and any readable text.",
            },
            {
              type: 'image_url',
              image_url: { url: urlCheck.url },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter Vision API error: ${response.status}`)
  }

  const data = await response.json()
  const analysis =
    data.choices?.[0]?.message?.content || "Impossible d'analyser l'image."

  const textMatch = analysis.match(/text[^:]*:?\s*([^.]*)/i)
  const extractedText = textMatch ? textMatch[1].trim() : ''

  return res.status(200).json({
    success: true,
    response: `Image analysée: ${analysis.substring(0, 100)}...`,
    caption: analysis,
    text: extractedText,
    description: analysis,
  })
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const action = getQueryValue(req.query.action)

  if (!action) {
    return res.status(400).json({
      error: 'Action missing',
      validActions: ['chat', 'vision'],
    })
  }

  const maxBytes = getMaxBodyBytes(action)
  const bodyResult = await parseBody(req, maxBytes)
  if (bodyResult?.error) {
    return res
      .status(bodyResult.error.status)
      .json({ error: bodyResult.error.message })
  }
  const body = bodyResult || {}
  const clerkSecretKey =
    process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY
  if (!clerkSecretKey) {
    return res.status(503).json({ error: 'Service auth non configuré' })
  }
  const { userId: clerkId, error: authError } = await verifyClerkAuth(
    req.headers.authorization
  )
  if (authError || !clerkId) {
    const errorMessage =
      process.env.NODE_ENV !== 'production' && authError
        ? authError
        : 'Unauthorized'
    return res.status(401).json({ error: errorMessage })
  }

  try {
    if (action === 'chat') {
      return await handleOpenRouterChat(req, res, body, clerkId)
    }
    if (action === 'vision') {
      return await handleOpenRouterVision(req, res, body, clerkId)
    }

    return res.status(400).json({
      error: 'Invalid action',
      validActions: ['chat', 'vision'],
    })
  } catch (error) {
    console.error('AI error:', error)
    return res.status(500).json({
      error: 'AI request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default withSentry(handler)
