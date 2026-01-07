/**
 * PolarEvent Model
 * Stores Polar webhook events for idempotency and auditing
 */

import mongoose from 'mongoose'

const PolarEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Unique index for idempotency
PolarEventSchema.index({ eventId: 1 }, { unique: true })

export const PolarEvent =
  mongoose.models.PolarEvent || mongoose.model('PolarEvent', PolarEventSchema)
