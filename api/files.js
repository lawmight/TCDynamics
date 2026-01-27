import crypto from 'crypto'
import mongoose from 'mongoose'
import { KnowledgeFile } from './_lib/models/KnowledgeFile.js'
import { connectToDatabase } from './_lib/mongodb.js'
import { withSentry } from './_lib/sentry.js'
import { embedText } from './_lib/vertex.js'

/**
 * Consolidated Files API
 * Handles both file listing and file upload
 *
 * Usage:
 * - GET /api/files - List files (with optional pagination: ?page=1&limit=50)
 * - POST /api/files - Upload a file
 */

const SUMMARY_LIMIT = 280
const SENSITIVE_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // card with separators
  /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/, // phone with separators
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

async function handler(req, res) {
  if (req.method === 'GET') {
    return await handleListFiles(req, res)
  }
  if (req.method === 'POST') {
    return await handleUploadFile(req, res)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}

export default withSentry(handler)

/**
 * Handle file listing
 */
async function handleListFiles(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    await connectToDatabase()

    const files = await KnowledgeFile.find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(parseInt(limit))
      .select('_id name path size mimeType summary createdAt')

    const data = files.map(file => ({
      id: file._id.toString(),
      name: file.name,
      path: file.path,
      size: file.size || 0,
      mimeType: file.mimeType,
      summary: file.summary,
      createdAt: file.createdAt,
    }))

    return res.status(200).json({ files: data })
  } catch (error) {
    console.error('Files list error', error)
    return res.status(500).json({ error: 'Internal error' })
  }
}

/**
 * Handle file upload with GridFS storage
 */
async function handleUploadFile(req, res) {
  const { fileName, mimeType, base64, size } = req.body || {}
  const includeSummaryRequested = parseIncludeSummaryFlag(req)

  if (!fileName || !base64) {
    return res.status(400).json({ error: 'fileName and base64 are required' })
  }

  try {
    await connectToDatabase()

    const buffer = Buffer.from(base64, 'base64')
    const randomSuffix = crypto.randomBytes(6).toString('hex')
    const uniqueName = `${Date.now()}-${randomSuffix}-${fileName}`
    const path = `uploads/${uniqueName}`

    // Upload to GridFS
    const db = mongoose.connection.db
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'files' })

    const uploadStream = bucket.openUploadStream(uniqueName, {
      contentType: mimeType || 'application/octet-stream',
    })

    uploadStream.end(buffer)

    try {
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve)
        uploadStream.on('error', reject)
      })
    } catch (uploadError) {
      // Clean up partial chunks if upload failed
      if (uploadStream.id) {
        try {
          await bucket.delete(uploadStream.id)
        } catch (deleteError) {
          console.warn('Failed to delete partial GridFS file', {
            fileId: uploadStream.id,
            error: deleteError,
          })
        }
      }
      throw uploadError
    }

    const gridfsFileId = uploadStream.id.toString()

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
          embedding = await embedText(embedInput)
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

    // Store metadata in KnowledgeFile collection
    try {
      await KnowledgeFile.findOneAndUpdate(
        { path },
        {
          $set: {
            path,
            name: uniqueName,
            size: size || buffer.length,
            mimeType: mimeType || 'application/octet-stream',
            summary: summaryAllowed ? sanitizedSummary : null,
            embedding,
            storageProvider: 'mongodb_gridfs',
            storagePath: gridfsFileId,
          },
        },
        { upsert: true, new: true }
      )
    } catch (metaError) {
      // Clean up orphaned GridFS file before logging
      try {
        const fileObjectId = new mongoose.Types.ObjectId(gridfsFileId)
        await bucket.delete(fileObjectId)
      } catch (deleteError) {
        console.warn('Failed to delete orphaned GridFS file', {
          gridfsFileId,
          error: deleteError,
        })
      }
      console.warn('Metadata save exception', metaError)
      // Rethrow to abort upload so calling code can handle cleanup
      throw metaError
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
