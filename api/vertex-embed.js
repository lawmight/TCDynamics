import { embedText } from './_lib/vertex.js'

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

  const { text } = req.body || {}
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required for embedding' })
  }

  try {
    const embedding = await embedText(text)
    return res.status(200).json({ embedding })
  } catch (error) {
    console.error('Vertex embedding error', error)
    return res.status(500).json({ error: 'Failed to embed text' })
  }
}
