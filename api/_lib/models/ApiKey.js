/**
 * ApiKey Model
 * Stores API keys for tenant authentication
 */

import mongoose from 'mongoose'

const ApiKeySchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, index: true },
    keyHash: { type: String, required: true, unique: true },
    keyPrefix: { type: String, required: true },
    revokedAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
)

// Indexes
ApiKeySchema.index({ clerkId: 1 })
ApiKeySchema.index({ clerkId: 1, revokedAt: 1 })

export const ApiKey =
  mongoose.models.ApiKey || mongoose.model('ApiKey', ApiKeySchema)
