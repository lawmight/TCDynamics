import { generateText } from './_lib/vertex.js'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, sessionId, temperature } = req.body || {}

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' })
  }

  if (!process.env.VERTEX_PROJECT_ID) {
    return res
      .status(500)
      .json({
        error: 'VERTEX_PROJECT_ID missing. Please configure Vertex env vars.',
      })
  }

  try {
    const result = await generateText({ messages, temperature })
    return res.status(200).json({
      message: result.message,
      usage: result.usage,
      sessionId,
    })
  } catch (error) {
    console.error('Vertex chat error', error)
    return res.status(500).json({
      error: 'Failed to generate response with Vertex AI',
    })
  }
}
