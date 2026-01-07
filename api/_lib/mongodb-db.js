/**
 * MongoDB Database Utility
 * Drop-in replacement for supabase.js functions
 * Maintains identical function signatures for minimal code changes
 */

import { ChatConversation } from './models/ChatConversation.js'
import { Contact } from './models/Contact.js'
import { DemoRequest } from './models/DemoRequest.js'
import Feedback from './models/Feedback.js'
import { PolarEvent } from './models/PolarEvent.js'
import { connectToDatabase } from './mongodb.js'

/**
 * Save contact form submission to MongoDB
 * @param {Object} contactData - Contact form data
 * @returns {Promise<{success: boolean, id?: string, error?: string, field?: string, code?: string}>}
 */
export async function saveContact(contactData) {
  try {
    await connectToDatabase()

    const contact = await Contact.create({
      name: contactData.name,
      email: contactData.email.toLowerCase().trim(),
      phone: contactData.phone || null,
      company: contactData.company || null,
      message: contactData.message,
      source: contactData.source || 'website',
      status: 'new',
      type: 'contact',
      clerkId: contactData.clerkId || null,
    })

    return { success: true, id: contact._id.toString() }
  } catch (error) {
    // Handle duplicate key error (E11000) - from MongoDB unique index
    if (error.code === 11000 || error.code === 'DUPLICATE_EMAIL') {
      return {
        success: false,
        error: 'Cette adresse email a déjà été utilisée pour nous contacter.',
        field: 'email',
        code: 'DUPLICATE_EMAIL',
      }
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError' && error.errors) {
      const messages = Object.values(error.errors)
        .map(e => e.message)
        .join(', ')

      // Check if it's a uniqueness validation error
      const isUniquenessError = Object.values(error.errors).some(
        e => e.kind === 'unique'
      )

      return {
        success: false,
        error: messages,
        code: isUniquenessError ? 'DUPLICATE_EMAIL' : 'VALIDATION_ERROR',
      }
    }

    // Log unexpected errors and return generic message
    console.error(
      'Unexpected error in saveContact:',
      error.message || 'Unknown error'
    )
    return {
      success: false,
      error: 'Une erreur inattendue est survenue. Veuillez réessayer.',
      code: 'INTERNAL_ERROR',
    }
  }
}

/**
 * Save demo request to MongoDB
 * @param {Object} demoData - Demo request data
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveDemoRequest(demoData) {
  try {
    await connectToDatabase()

    const demoRequest = await DemoRequest.create({
      name: demoData.name,
      email: demoData.email.toLowerCase().trim(),
      company: demoData.company,
      phone: demoData.phone || null,
      jobTitle: demoData.jobTitle || null,
      companySize: demoData.companySize || null,
      industry: demoData.industry || null,
      businessNeeds: demoData.businessNeeds,
      useCase: demoData.useCase || null,
      timeline: demoData.timeline || null,
      message: demoData.message || null,
      preferredDate: demoData.preferredDate
        ? new Date(demoData.preferredDate)
        : null,
      status: 'pending',
      type: 'demo_request',
      clerkId: demoData.clerkId || null,
    })

    return { success: true, id: demoRequest._id.toString() }
  } catch (error) {
    console.error('Save demo request error:', error.message || 'Unknown error')
    return {
      success: false,
      error: 'Unable to save demo request. Please try again.',
    }
  }
}

/**
 * Save or update chat conversation to MongoDB
 * @param {Object} conversationData - Conversation data
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveConversation(conversationData) {
  try {
    await connectToDatabase()

    // Build messages array
    const messages = [
      {
        role: 'user',
        content: conversationData.userMessage,
        timestamp: new Date(),
      },
      {
        role: 'assistant',
        content: conversationData.aiResponse,
        timestamp: new Date(),
      },
    ]

    // Try to find existing conversation by sessionId
    const existing = await ChatConversation.findOne({
      sessionId: conversationData.sessionId,
    })

    if (existing) {
      // Update existing conversation - append messages
      const updatedMessages = [...(existing.messages || []), ...messages]

      // Keep only the last 1000 messages to prevent document size issues
      const MAX_MESSAGES = 1000
      if (updatedMessages.length > MAX_MESSAGES) {
        updatedMessages.splice(0, updatedMessages.length - MAX_MESSAGES)
      }

      existing.messages = updatedMessages
      existing.messageCount = updatedMessages.length
      existing.lastMessageAt = new Date()
      if (conversationData.metadata) {
        existing.metadata = {
          ...existing.metadata,
          ...conversationData.metadata,
        }
      }

      await existing.save()
      return { success: true, id: existing._id.toString() }
    } else {
      // Create new conversation
      const conversation = await ChatConversation.create({
        sessionId: conversationData.sessionId,
        conversationId: conversationData.sessionId,
        userEmail: conversationData.userEmail || null,
        clerkId: conversationData.clerkId || null,
        messages: messages,
        messageCount: messages.length,
        metadata: conversationData.metadata || {},
        conversationStatus: 'active',
        type: 'chat',
        lastMessageAt: new Date(),
      })

      return { success: true, id: conversation._id.toString() }
    }
  } catch (error) {
    console.error('Save conversation error:', error.message || 'Unknown error')
    return {
      success: false,
      error: 'Unable to save conversation. Please try again.',
    }
  }
}

/**
 * Save feedback to MongoDB
 * @param {Object} feedbackData - Feedback form data
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveFeedback(feedbackData) {
  try {
    await connectToDatabase()

    const feedback = await Feedback.create({
      formType: feedbackData.form_type,
      rating: feedbackData.rating,
      feedbackText: feedbackData.feedback_text || null,
      userEmail: feedbackData.user_email
        ? feedbackData.user_email.toLowerCase().trim()
        : null,
      userCompany: feedbackData.user_company || null,
      allowFollowup: feedbackData.allow_followup || false,
      clerkId: feedbackData.clerkId || null,
    })
    console.error('Save feedback error:', error.message || 'Unknown error')
    return {
      success: false,
      error: 'Unable to save feedback. Please try again.',
    }
  } catch (error) {
    console.error('Save feedback error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save a Polar event for idempotency and auditing
 * @param {Object} polarEvent - Polar event payload
 * @returns {Promise<{success: boolean, id?: string, error?: string, duplicate?: boolean}>}
 */
export async function savePolarEvent(polarEvent) {
  try {
    await connectToDatabase()

    try {
      const event = await PolarEvent.create({
        eventId: polarEvent.eventId || polarEvent.id,
        type: polarEvent.type,
        payload: polarEvent,
      })

      return { success: true, id: event._id.toString(), duplicate: false }
    } catch (error) {
      // Unique constraint violation (duplicate event)
      if (error.code === 11000 || error.name === 'MongoServerError') {
        return { success: true, duplicate: true }
      }
      throw error
    }
  } catch (error) {
    console.error('Save polar event error:', error.message || 'Unknown error')
    return {
      success: false,
      error: 'Unable to save polar event. Please try again.',
    }
  }
}

export default {
  saveContact,
  saveDemoRequest,
  saveConversation,
  saveFeedback,
  savePolarEvent,
}
