import { generateText, embedText } from './_lib/vertex.js'

/**
 * Consolidated Vertex AI API
 * Handles both chat and embed operations
 * 
 * Usage:
 * - POST /api/vertex?action=chat - Generate chat response
 * - POST /api/vertex?action=embed - Generate text embeddings
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action } = req.query

  if (!process.env.VERTEX_PROJECT_ID) {
    return res.status(500).json({
      error: 'VERTEX_PROJECT_ID missing. Please configure Vertex env vars.',
    })
  }

  try {
    if (action === 'chat') {
      return await handleChat(req, res)
    } else if (action === 'embed') {
      return await handleEmbed(req, res)
    } else {
      return res.status(400).json({
        error: 'Action invalide',
        validActions: ['chat', 'embed'],
      })
    }
  } catch (error) {
    console.error('Vertex AI error:', error)
    return res.status(500).json({
      error: 'Failed to process Vertex AI request',
      message: error.message,
    })
  }
}

/**
 * Handle chat generation
 */
async function handleChat(req, res) {
  const { messages, sessionId, temperature } = req.body || {}

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

/**
 * Handle text embedding
 */
async function handleEmbed(req, res) {
  const { text } = req.body || {}

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required for embedding' })
  }

  const embedding = await embedText(text)
  return res.status(200).json({ embedding })
}

