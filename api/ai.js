import crypto from 'crypto'
import { saveConversation } from './_lib/mongodb-db.js'
import { getClientIp, parseJsonBody } from './_lib/request-guards.js'
import { withSentry } from './_lib/sentry.js'
import { embedText, generateText } from './_lib/vertex.js'

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

const CHAT_MAX_BODY_BYTES = 10 * 1024 // 10KB for chat messages
const VERTEX_MAX_BODY_BYTES = 5 * 1024 * 1024 // 5MB for Vertex payloads
const VISION_MAX_BODY_BYTES = 256 * 1024 // 256KB for image URL requests

function getQueryValue(value) {
  if (Array.isArray(value)) return value[0]
  return value
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

function getMaxBodyBytes(provider, action) {
  if (provider === 'vertex') return VERTEX_MAX_BODY_BYTES
  if (provider === 'openai' && action === 'chat') return CHAT_MAX_BODY_BYTES
  if (provider === 'openai' && action === 'vision') return VISION_MAX_BODY_BYTES
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

async function handleOpenAiChat(req, res, body) {
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

  const { message, sessionId, userEmail, maxTokens } = body || {}
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

  // Check if OpenAI is configured
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    return res.status(503).json({ error: 'Service IA non configuré' })
  }

  const cappedMaxTokens =
    typeof maxTokens === 'number'
      ? Math.max(1, Math.min(MAX_TOKENS, maxTokens))
      : MAX_TOKENS

  // Call OpenAI (keep lightweight for internal/testing)
  const openaiApiUrl =
    process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions'
  const response = await fetch(openaiApiUrl, {
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
    const metadata = {
      model: 'gpt-3.5-turbo',
      tokens_used: tokensUsed,
      temperature: 0.7,
      source: 'vercel-chat',
      origin: ALLOWED_ORIGIN,
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

  return res.status(200).json({
    success: true,
    response: aiResponse,
    conversationId,
  })
}

async function handleOpenAiVision(req, res, body) {
  const { imageUrl } = body || {}

  // Type-check imageUrl before calling string methods
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return res.status(400).json({ error: "URL d'image requise" })
  }

  // Basic URL validation
  try {
    new URL(imageUrl)
  } catch {
    return res.status(400).json({ error: "URL d'image invalide" })
  }

  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    return res.status(503).json({ error: 'Service Vision non configuré' })
  }

  // Use OpenAI Vision API (GPT-4o)
  const openaiApiUrl =
    process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions'
  const response = await fetch(openaiApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
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
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI Vision API error: ${response.status}`)
  }

  const data = await response.json()
  const analysis =
    data.choices?.[0]?.message?.content || "Impossible d'analyser l'image."

  // Extract text if possible (simple extraction)
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

async function handleVertexChat(req, res, body) {
  const { messages, sessionId, temperature } = body || {}

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' })
  }

  const result = await generateText({ messages, temperature })
  return res.status(200).json({
    message: result.message,
    usage: result.usage,
    sessionId,
  })
}

async function handleVertexEmbed(req, res, body) {
  const { text } = body || {}

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required for embedding' })
  }

  const embedding = await embedText(text)
  return res.status(200).json({ embedding })
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const provider = getQueryValue(req.query.provider) || 'openai'
  const action = getQueryValue(req.query.action)

  if (!action) {
    return res.status(400).json({
      error: 'Action missing',
      validActions: {
        openai: ['chat', 'vision'],
        vertex: ['chat', 'embed'],
      },
    })
  }

  if (provider === 'vertex' && !process.env.VERTEX_PROJECT_ID) {
    return res.status(500).json({
      error: 'VERTEX_PROJECT_ID missing. Please configure Vertex env vars.',
    })
  }

  const maxBytes = getMaxBodyBytes(provider, action)
  const bodyResult = await parseBody(req, maxBytes)
  if (bodyResult?.error) {
    return res
      .status(bodyResult.error.status)
      .json({ error: bodyResult.error.message })
  }
  const body = bodyResult || {}

  try {
    if (provider === 'openai' && action === 'chat') {
      return await handleOpenAiChat(req, res, body)
    }
    if (provider === 'openai' && action === 'vision') {
      return await handleOpenAiVision(req, res, body)
    }
    if (provider === 'vertex' && action === 'chat') {
      return await handleVertexChat(req, res, body)
    }
    if (provider === 'vertex' && action === 'embed') {
      return await handleVertexEmbed(req, res, body)
    }

    return res.status(400).json({
      error: 'Invalid action',
      validActions: {
        openai: ['chat', 'vision'],
        vertex: ['chat', 'embed'],
      },
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
