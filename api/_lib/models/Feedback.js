/**
 * Feedback Model
 * Stores customer feedback from demo and contact forms
 */

import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      enum: ['demo', 'contact'],
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedbackText: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userCompany: {
      type: String,
      trim: true,
    },
    allowFollowup: {
      type: Boolean,
      default: false,
    },
    clerkId: {
      type: String,
      sparse: true,
    },
  },
  { timestamps: true }
)

feedbackSchema.index({ createdAt: -1 })
feedbackSchema.index({ formType: 1, createdAt: -1 })

export default mongoose.models.Feedback ||
  mongoose.model('Feedback', feedbackSchema)
