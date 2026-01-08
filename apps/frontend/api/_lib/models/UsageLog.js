/**
 * UsageLog Model
 * Tracks API activity for analytics and billing purposes
 */

import mongoose from 'mongoose'

const UsageLogSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      required: true,
    },
    status: {
      type: Number,
      required: true,
      index: true,
    },
    responseTimeMs: { type: Number, default: null },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true, // createdAt = request timestamp
  }
)

// TTL index: Auto-delete logs after 90 days
UsageLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
)

// Compound indexes for analytics queries
UsageLogSchema.index({ clerkId: 1, createdAt: -1 })
UsageLogSchema.index({ endpoint: 1, status: 1 })

export const UsageLog =
  mongoose.models.UsageLog || mongoose.model('UsageLog', UsageLogSchema)
