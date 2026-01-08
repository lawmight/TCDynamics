/**
 * AnalyticsEvent Model
 * Stores custom analytics events
 */

import mongoose from 'mongoose'

const AnalyticsEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    clerkId: { type: String, default: null },
  },
  {
    timestamps: true,
  }
)

// Indexes
AnalyticsEventSchema.index({ event: 1 })
AnalyticsEventSchema.index({ clerkId: 1 })
AnalyticsEventSchema.index({ clerkId: 1, event: 1 })
AnalyticsEventSchema.index({ createdAt: -1 })

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent ||
  mongoose.model('AnalyticsEvent', AnalyticsEventSchema)
