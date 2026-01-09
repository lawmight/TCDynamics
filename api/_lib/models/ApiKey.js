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
    name: { type: String, default: null },
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
// Compound index for optimized filtering of active keys before bcrypt comparison
ApiKeySchema.index({ revokedAt: 1, clerkId: 1 })
// Index on keyPrefix for fast pre-filtering before bcrypt comparison
ApiKeySchema.index({ keyPrefix: 1 })
// Compound index for keyPrefix + revokedAt filtering (optimal for verification query)
ApiKeySchema.index({ revokedAt: 1, keyPrefix: 1 })

export const ApiKey =
  mongoose.models.ApiKey || mongoose.model('ApiKey', ApiKeySchema)
