/**
 * Contact Model
 * Stores contact form submissions
 */

import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true, // Auto-normalize to lowercase before save
      trim: true,
      match: [/.+@.+\..+/, 'Veuillez entrer une adresse email valide'],
      maxlength: [254, "L'email ne peut pas dépasser 254 caractères"],
    },
    phone: { type: String, default: null },
    company: { type: String, default: null },
    message: { type: String, required: true },
    source: { type: String, default: 'website' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'closed'],
      default: 'new',
    },
    type: { type: String, default: 'contact' },
    // Optional: Link to Clerk user if authenticated
    clerkId: { type: String, default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
)

// Case-insensitive unique index with French locale collation
ContactSchema.index(
  { email: 1 },
  {
    unique: true,
    name: 'email_unique_ci',
    collation: { locale: 'fr', strength: 2 }, // Case-insensitive
  }
)

// Other indexes for common queries
ContactSchema.index({ status: 1 })
ContactSchema.index({ createdAt: -1 })
// Compound index for filtering by status and sorting by date
ContactSchema.index({ status: 1, createdAt: -1 })
// Sparse index for linking authenticated contacts to users
ContactSchema.index({ clerkId: 1 }, { sparse: true })

// mongoose-unique-validator provides cleaner validation errors
ContactSchema.plugin(uniqueValidator, {
  message: 'Cette {PATH} est déjà utilisée',
})

// Global post-save error handler for E11000 (backup for plugin)
ContactSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'email'
    const customError = new Error(`Cette adresse email existe déjà`)
    customError.status = 409
    customError.field = field
    customError.code = 'DUPLICATE_EMAIL'
    next(customError)
  } else {
    next(error)
  }
})

// Also handle findOneAndUpdate operations
ContactSchema.post('findOneAndUpdate', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const customError = new Error(`Cette adresse email existe déjà`)
    customError.status = 409
    customError.code = 'DUPLICATE_EMAIL'
    next(customError)
  } else {
    next(error)
  }
})

export const Contact =
  mongoose.models.Contact || mongoose.model('Contact', ContactSchema)
