/**
 * DemoRequest Model
 * Stores demo request form submissions
 */

import mongoose from 'mongoose'

const DemoRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    company: { type: String, required: true },
    phone: { type: String, default: null },
    jobTitle: { type: String, default: null },
    companySize: { type: String, default: null },
    industry: { type: String, default: null },
    businessNeeds: { type: String, required: true },
    useCase: { type: String, default: null },
    timeline: { type: String, default: null },
    message: { type: String, default: null },
    preferredDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'canceled'],
      default: 'pending',
    },
    type: { type: String, default: 'demo_request' },
    clerkId: { type: String, default: null },
  },
  {
    timestamps: true,
  }
)

// Indexes
DemoRequestSchema.index({ email: 1 })
DemoRequestSchema.index({ status: 1 })
DemoRequestSchema.index({ company: 1 })
DemoRequestSchema.index({ createdAt: -1 })

export const DemoRequest =
  mongoose.models.DemoRequest ||
  mongoose.model('DemoRequest', DemoRequestSchema)
