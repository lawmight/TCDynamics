/**
 * User Model
 * Syncs with Clerk via webhooks. The clerkId is the primary identifier.
 * Replaces the previous "Org" concept with a user-centric model.
 */

import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'starter',
      index: true,
    },
    // Subscription fields (synced via Polar webhook)
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', null],
      default: null,
    },
    polarCustomerId: { type: String, default: null },
    polarSubscriptionId: { type: String, default: null },
    // Clerk metadata
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    imageUrl: { type: String, default: null },
    // Soft delete tracking
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
)

// Compound indexes for common queries
UserSchema.index({ clerkId: 1 }, { unique: true })
UserSchema.index({ subscriptionStatus: 1, plan: 1 })
UserSchema.index({ email: 1 })

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
