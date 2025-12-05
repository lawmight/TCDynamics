import crypto from 'crypto'
import { getSupabaseClient } from './_lib/supabase.js'
import { embedText } from './_lib/vertex.js'

const SUMMARY_LIMIT = 280
const SENSITIVE_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // card with separators
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // card with separators
  /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/, // phone with separators
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // email
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // email
  /api[_-]?key[:=]\s*[A-Za-z0-9\-_.]{12,}/i, // api keys
  /secret[:=]\s*[A-Za-z0-9\-_.]{8,}/i,
]

const maskSensitiveContent = (text = '') =>
  text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
    .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[REDACTED_CARD]')
    .replace(/\b\d{10}\b/g, '[REDACTED_PHONE]')
    .replace(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g, '[REDACTED_PHONE]')
    .replace(/api[_-]?key[:=]\s*[A-Za-z0-9\-_.]{12,}/gi, '[REDACTED_TOKEN]')
    .replace(/secret[:=]\s*[A-Za-z0-9\-_.]{8,}/gi, '[REDACTED_SECRET]')

const containsSensitiveData = (text = '') =>
  SENSITIVE_PATTERNS.some(pattern => pattern.test(text))

const parseIncludeSummaryFlag = req => {
  const flag = req?.query?.includeSummary ?? req?.body?.includeSummary
  if (typeof flag === 'boolean') return flag
  if (typeof flag === 'string') {
    return ['true', '1', 'yes', 'on'].includes(flag.toLowerCase())
  }
  return false
}

export const buildSanitizedSummary = (textContent, includeSummaryRequested) => {
  if (!includeSummaryRequested || !textContent) {
    return { summary: null, allowed: false, reason: 'not_requested' }
  }

  const trimmed = textContent.slice(0, SUMMARY_LIMIT)
  if (containsSensitiveData(trimmed)) {
    return { summary: null, allowed: false, reason: 'pii_detected' }
  }

  return {
    summary: maskSensitiveContent(trimmed),
    allowed: true,
    reason: 'allowed',
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
}

export const createFilesUploadHandler = ({
  supabaseClientFactory = getSupabaseClient,
  embedTextFn = embedText,
} = {}) =>
  async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { fileName, mimeType, base64, size } = req.body || {}
    const includeSummaryRequested = parseIncludeSummaryFlag(req)

    if (!fileName || !base64) {
      return res.status(400).json({ error: 'fileName and base64 are required' })
    }

    try {
      const supabase = supabaseClientFactory()
      const bucket = process.env.SUPABASE_BUCKET || 'documents'
      const buffer = Buffer.from(base64, 'base64')
      const randomSuffix = crypto.randomBytes(6).toString('hex')
      const uniqueName = `${Date.now()}-${randomSuffix}-${fileName}`
      const path = `uploads/${uniqueName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: mimeType || 'application/octet-stream',
          upsert: false,
        })

      if (uploadError) {
        const isCollision =
          uploadError?.statusCode === 409 ||
          uploadError?.status === 409 ||
          uploadError?.message?.toLowerCase()?.includes('exists')

        if (isCollision) {
          console.warn('Supabase upload collision detected', uploadError)
          return res.status(409).json({
            error: 'File already exists, please retry with a new name',
          })
        }

        console.error('Supabase upload error', uploadError)
        return res.status(500).json({ error: 'Failed to upload file' })
      }

      const mimeLower = (mimeType || '').toLowerCase()
      const textLikeMimeTypes = new Set([
        'application/json',
        'application/javascript',
        'application/xml',
        'application/xhtml+xml',
        'application/sql',
        'application/csv',
        'text/csv',
        'text/markdown',
        'text/x-markdown',
        'application/x-yaml',
        'application/yaml',
        'text/yaml',
        'text/x-yaml',
      ])

      const isTextLike =
        (mimeLower && mimeLower.startsWith('text/')) ||
        textLikeMimeTypes.has(mimeLower)
      const isPdf = mimeLower === 'application/pdf'
      const isDocx =
        mimeLower ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      const isDoc = mimeLower === 'application/msword'

      let textContent = ''
      let embedding = []

      if (isTextLike) {
        textContent = buffer.toString('utf-8').slice(0, 8000)
        const embedInput = textContent || fileName || ''
        if (embedInput) {
          try {
            embedding = await embedTextFn(embedInput)
          } catch (embeddingError) {
            console.warn(
              'Embedding failed, continuing without vectors',
              embeddingError
            )
          }
        } else {
          console.info('No textual content to embed', { fileName, mimeType })
        }
      } else if (isPdf || isDocx || isDoc) {
        console.info('Skipping embedding for binary document type', {
          fileName,
          mimeType,
        })
      } else {
        console.info('Skipping embedding for unsupported mimeType', {
          fileName,
          mimeType,
        })
      }

      const { summary: sanitizedSummary, allowed: summaryAllowed } =
        buildSanitizedSummary(textContent, includeSummaryRequested)

      // Store metadata + embedding
      try {
        const { error: insertError } = await supabase
          .from('knowledge_files')
          .upsert({
            path,
            name: uniqueName,
            size: size || buffer.length,
            mime_type: mimeType || 'application/octet-stream',
            summary: summaryAllowed ? sanitizedSummary : null,
            embedding,
          })
        if (insertError) {
          console.warn('Could not save metadata', insertError)
        }
      } catch (metaError) {
        console.warn('Metadata save exception', metaError)
      }

      return res.status(200).json({
        success: true,
        path,
        summary: summaryAllowed ? sanitizedSummary : undefined,
      })
    } catch (error) {
      console.error('File upload error', error)
      return res.status(500).json({ error: 'Upload failed' })
    }
  }

export default createFilesUploadHandler()
