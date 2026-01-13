import { GoogleAuth } from 'google-auth-library'

import { logger } from './logger.js'
import { transformMessagesToContents } from './vertex-message-transformer.js'

const SCOPES = ['https://www.googleapis.com/auth/cloud-platform']
let cachedClient = null
let cachedClientPromise = null

const getCredentials = () => {
  const raw = process.env.VERTEX_SERVICE_ACCOUNT_JSON
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch (error) {
    logger.error('Failed to parse VERTEX_SERVICE_ACCOUNT_JSON', error)
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
  // Default to 'us-central1' for backward compatibility. Using 'global' (via VERTEX_LOCATION env var)
  // changes data residency (data may be processed outside your region) and some features may be
  // unavailable. Set VERTEX_LOCATION=global explicitly if you need global endpoint access.
  const location = process.env.VERTEX_LOCATION || 'us-central1'
  const model = process.env.VERTEX_MODEL || 'gemini-3-flash-preview'
  const embedModel = process.env.VERTEX_EMBED_MODEL || 'text-embedding-005'

  if (!projectId) {
    throw new Error('VERTEX_PROJECT_ID is required')
  }

  return { projectId, location, model, embedModel }
}

/**
 * Builds the Vertex AI API URL for generateContent
 * @param {string} projectId - Google Cloud project ID
 * @param {string} location - Vertex AI location/region
 * @param {string} model - Model name
 * @returns {string} Full API URL
 */
const buildGenerateContentUrl = (projectId, location, model) => {
  // For global region, use aiplatform.googleapis.com (no regional prefix)
  const host =
    location === 'global'
      ? 'aiplatform.googleapis.com'
      : `${location}-aiplatform.googleapis.com`
  const pathLocation = location === 'global' ? 'global' : location
  return `https://${host}/v1/projects/${projectId}/locations/${pathLocation}/publishers/google/models/${model}:generateContent`
}

/**
 * Extracts the message text from Vertex AI response
 * @param {Object} responseData - Response data from Vertex AI API
 * @returns {string} Extracted message text
 */
const extractMessageFromResponse = responseData => {
  const candidates = responseData?.candidates || []
  const textParts =
    Array.isArray(candidates) && candidates.length > 0
      ? candidates[0]?.content?.parts || []
      : []
  return textParts
    .filter(part => typeof part?.text === 'string')
    .map(part => part.text)
    .join('')
}

/**
 * Generates text using Vertex AI
 * @param {Object} params - Generation parameters
 * @param {Array} params.messages - Array of message objects with role and content
 * @param {number} [params.temperature=0.4] - Temperature for generation
 * @returns {Promise<Object>} Response with message and usage metadata
 */
export const generateText = async ({ messages, temperature = 0.4 }) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required and must not be empty')
  }

  const client = await getAuthClient()
  const { projectId, location, model } = getProjectConfig()

  // Transform messages to Vertex AI format
  const contents = transformMessagesToContents(messages)

  if (contents.length === 0) {
    throw new Error(
      'No valid messages after transformation. All messages were filtered out.'
    )
  }

  const url = buildGenerateContentUrl(projectId, location, model)

  const body = {
    contents,
    generationConfig: {
      temperature,
    },
  }

  try {
    const response = await client.request({
      url,
      method: 'POST',
      data: body,
    })

    const message = extractMessageFromResponse(response.data)
    const usage = response.data?.usageMetadata || {}

    return { message, usage }
  } catch (error) {
    logger.error('Vertex AI generateText request failed', {
      error: error.message,
      projectId,
      location,
      model,
    })
    throw error
  }
}

export const embedText = async text => {
  const client = await getAuthClient()
  const { projectId, location, embedModel } = getProjectConfig()

  // For global region, use aiplatform.googleapis.com (no regional prefix)
  const host =
    location === 'global'
      ? 'aiplatform.googleapis.com'
      : `${location}-aiplatform.googleapis.com`
  const pathLocation = location === 'global' ? 'global' : location
  const url = `https://${host}/v1/projects/${projectId}/locations/${pathLocation}/publishers/google/models/${embedModel}:predict`

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
