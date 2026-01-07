/**
 * MongoDB Connection Utility
 * Singleton pattern for Vercel serverless optimization
 *
 * Pattern: https://github.com/vercel/next.js/blob/canary/examples/with-mongodb
 */

import mongoose from 'mongoose'

// Global connection cache (reused across Vercel serverless invocations)
let cached = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

/**
 * Connect to MongoDB Atlas with serverless optimization
 * @returns {Promise<typeof mongoose>} Mongoose connection
 */
export async function connectToDatabase() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn
  }

  // Return existing promise if connection is in progress
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI

    if (!MONGODB_URI) {
      throw new Error(
        'MongoDB configuration missing. Check MONGODB_URI environment variable.'
      )
    }

    const opts = {
      bufferCommands: false, // Fail fast in serverless
      maxPoolSize: 10, // Prevent connection exhaustion
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
      console.log('✅ MongoDB connected')
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default { connectToDatabase }
