import { GoogleAuth } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/cloud-platform']
let cachedClient = null
let cachedClientPromise = null

const getCredentials = () => {
  const raw = process.env.VERTEX_SERVICE_ACCOUNT_JSON
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch (error) {
    console.error('Failed to parse VERTEX_SERVICE_ACCOUNT_JSON', error)
    throw error
  }
}

export const getAuthClient = async () => {
  if (cachedClient) return cachedClient
  if (cachedClientPromise) return cachedClientPromise

  const auth = new GoogleAuth({
    credentials: getCredentials(),
    scopes: SCOPES,
  })

  cachedClientPromise = auth
    .getClient()
    .then(client => {
      cachedClient = client
      return client
    })
    .catch(error => {
      cachedClientPromise = null
      throw error
    })

  return cachedClientPromise
}

export const getProjectConfig = () => {
  const projectId = process.env.VERTEX_PROJECT_ID
  const location = process.env.VERTEX_LOCATION || 'europe-west1'
  const model = process.env.VERTEX_MODEL || 'gemini-3-flash-preview'
  const embedModel = process.env.VERTEX_EMBED_MODEL || 'text-embedding-005'

  if (!projectId) {
    throw new Error('VERTEX_PROJECT_ID is required')
  }

  return { projectId, location, model, embedModel }
}

export const generateText = async ({ messages, temperature = 0.4 }) => {
  const client = await getAuthClient()
  const { projectId, location, model } = getProjectConfig()

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`

  const toSafeText = value => {
    if (value === undefined || value === null) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean')
      return String(value)
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  const normalizeEntryToParts = (entry, parts) => {
    if (entry === undefined || entry === null) return

    // Strings, numbers, booleans -> text part
    if (
      typeof entry === 'string' ||
      typeof entry === 'number' ||
      typeof entry === 'boolean'
    ) {
      const text = toSafeText(entry)
      if (text) parts.push({ text })
      return
    }

    // Arrays -> normalize each element
    if (Array.isArray(entry)) {
      entry.forEach(item => normalizeEntryToParts(item, parts))
      return
    }

    if (typeof entry === 'object') {
      // Inline/file data already in Vertex format
      if (entry.inlineData?.mimeType && entry.inlineData?.data) {
        parts.push({ inlineData: entry.inlineData })
        return
      }
      if (entry.fileData?.fileUri) {
        parts.push({ fileData: entry.fileData })
        return
      }

      // Common OpenAI-style multimodal payloads
      if (entry.type === 'image_url' && entry.image_url?.url) {
        parts.push({ fileData: { fileUri: entry.image_url.url } })
        return
      }

      // Nested parts array -> flatten safely
      if (Array.isArray(entry.parts)) {
        entry.parts.forEach(item => normalizeEntryToParts(item, parts))
        return
      }

      // Objects with text content
      if (typeof entry.text === 'string') {
        const text = entry.text
        if (text) parts.push({ text })
        return
      }

      // Fallback: stringify object to text
      const text = toSafeText(entry)
      if (text) parts.push({ text })
      return
    }

    // Fallback for any other type
    const text = toSafeText(entry)
    if (text) parts.push({ text })
  }

  const mapRole = role => {
    if (role === 'assistant') return 'model'
    if (role === 'system') return 'user' // Vertex generateContent does not use a dedicated system role; fold into user
    return 'user'
  }

  const contents = messages
    .map(msg => {
      const parts = []
      normalizeEntryToParts(msg?.content, parts)

      // Drop empty text parts to avoid Vertex rejection
      const filteredParts = parts
        .map(part => {
          if (typeof part?.text === 'string') {
            const text = part.text.trim()
            return text ? { text } : null
          }
          return part
        })
        .filter(Boolean)

      // Skip messages with no usable content
      if (filteredParts.length === 0) return null

      return {
        role: mapRole(msg?.role),
        parts: filteredParts,
      }
    })
    .filter(Boolean)

  const body = {
    contents,
    generationConfig: {
      temperature,
    },
  }

  const response = await client.request({
    url,
    method: 'POST',
    data: body,
  })

  const candidates = response.data?.candidates || []
  const textParts =
    Array.isArray(candidates) && candidates.length > 0
      ? candidates[0]?.content?.parts || []
      : []
  const message = textParts
    .filter(part => typeof part?.text === 'string')
    .map(part => part.text)
    .join('')
  const usage = response.data?.usageMetadata || {}

  return { message, usage }
}

export const embedText = async text => {
  const client = await getAuthClient()
  const { projectId, location, embedModel } = getProjectConfig()

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${embedModel}:predict`

  const response = await client.request({
    url,
    method: 'POST',
    data: {
      instances: [{ content: text.slice(0, 20000) }],
    },
  })

  const embedding =
    response.data?.predictions?.[0]?.embeddings?.values ||
    response.data?.predictions?.[0]?.values ||
    []

  return embedding
}
