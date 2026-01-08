/**
 * ChatConversation Model
 * Stores chat conversation logs with embedded messages
 */

import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false } // Don't create _id for subdocuments
)

const ChatConversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    conversationId: { type: String, default: null },
    userEmail: { type: String, default: null },
    clerkId: { type: String, default: null, index: true },
    messages: { type: [MessageSchema], default: [] },
    messageCount: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    conversationStatus: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    type: { type: String, default: 'chat' },
    lastMessageAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

// Pre-save middleware to keep denormalized fields in sync
// Indexes for chat retrieval
ChatConversationSchema.index({ clerkId: 1, conversationStatus: 1 })
ChatConversationSchema.index({ lastMessageAt: -1 })
  if (Array.isArray(this.messages)) {
    this.messageCount = this.messages.length

    // Update lastMessageAt to the timestamp of the last message (if any)
    if (this.messages.length > 0) {
      const lastMessage = this.messages[this.messages.length - 1]
      if (lastMessage && lastMessage.timestamp) {
        this.lastMessageAt = lastMessage.timestamp
      }
    }
  }
  next()
})

// Indexes for chat retrieval
ChatConversationSchema.index({ sessionId: 1 })
ChatConversationSchema.index({ clerkId: 1 })
ChatConversationSchema.index({ clerkId: 1, conversationStatus: 1 })
ChatConversationSchema.index({ lastMessageAt: -1 })

export const ChatConversation =
  mongoose.models.ChatConversation ||
  mongoose.model('ChatConversation', ChatConversationSchema)
