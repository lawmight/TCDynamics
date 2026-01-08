/**
 * KnowledgeFile Model
 * Stores file metadata with reference to GridFS storage
 */

import mongoose from 'mongoose'

const KnowledgeFileSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/octet-stream' },
    summary: { type: String, default: null },
    embedding: { type: [Number], default: [] },
    // Storage location
    storageProvider: {
      type: String,
      enum: ['mongodb_gridfs', 's3', 'cloudflare_r2'],
      default: 'mongodb_gridfs',
    },
    storagePath: { type: String, default: null },
    clerkId: { type: String, default: null, index: true },
  },
  {
    timestamps: true,
  }
)

// Indexes
KnowledgeFileSchema.index({ path: 1 }, { unique: true })
KnowledgeFileSchema.index({ clerkId: 1 })
KnowledgeFileSchema.index({ createdAt: -1 })

export const KnowledgeFile =
  mongoose.models.KnowledgeFile ||
  mongoose.model('KnowledgeFile', KnowledgeFileSchema)
