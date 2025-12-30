/**
 * Supabase Client Utility
 * Singleton pattern for connection pooling optimization (Research-recommended)
 * Uses service role key for server-side operations (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js'

// Module-scope singleton (reused across invocations for performance)
let supabaseClient = null

/**
 * Get or create Supabase client
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Supabase configuration missing. Check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
      )
    }

    // Create client with service role key (bypasses RLS for server-side operations)
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return supabaseClient
}

/**
 * Save contact form submission to Supabase
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Contact name
 * @param {string} contactData.email - Contact email
 * @param {string} contactData.message - Contact message
 * @param {string} [contactData.phone] - Contact phone (optional)
 * @param {string} [contactData.company] - Contact company (optional)
 * @param {string} [contactData.source='website'] - Source of contact
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveContact(contactData) {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name: contactData.name,
          email: contactData.email.toLowerCase().trim(),
          phone: contactData.phone || null,
          company: contactData.company || null,
          message: contactData.message,
          source: contactData.source || 'website',
          status: 'new',
          type: 'contact',
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase contact insert error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Save contact error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save demo request to Supabase
 * @param {Object} demoData - Demo request data
 * @param {string} demoData.name - Requester name
 * @param {string} demoData.email - Requester email
 * @param {string} demoData.company - Company name (required)
 * @param {string} demoData.businessNeeds - Business needs description (required)
 * @param {string} [demoData.phone] - Phone number (optional)
 * @param {string} [demoData.jobTitle] - Job title (optional)
 * @param {string} [demoData.companySize] - Company size (optional)
 * @param {string} [demoData.industry] - Industry (optional)
 * @param {string} [demoData.useCase] - Use case (optional)
 * @param {string} [demoData.timeline] - Timeline (optional)
 * @param {string} [demoData.message] - Additional message (optional)
 * @param {string} [demoData.preferredDate] - Preferred demo date (optional)
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveDemoRequest(demoData) {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('demo_requests')
      .insert([
        {
          name: demoData.name,
          email: demoData.email.toLowerCase().trim(),
          company: demoData.company,
          phone: demoData.phone || null,
          job_title: demoData.jobTitle || null,
          company_size: demoData.companySize || null,
          industry: demoData.industry || null,
          business_needs: demoData.businessNeeds, // CRITICAL: camelCase → snake_case mapping
          use_case: demoData.useCase || null,
          timeline: demoData.timeline || null,
          message: demoData.message || null,
          preferred_date: demoData.preferredDate || null,
          status: 'pending',
          type: 'demo_request',
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase demo request insert error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Save demo request error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save or update chat conversation to Supabase
 * @param {Object} conversationData - Conversation data
 * @param {string} conversationData.sessionId - Session ID
 * @param {string} conversationData.userMessage - User message
 * @param {string} conversationData.aiResponse - AI response
 * @param {string} [conversationData.userEmail] - User email (optional)
 * @param {Object} [conversationData.metadata] - Additional metadata (optional)
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveConversation(conversationData) {
  try {
    const supabase = getSupabaseClient()

    // Build messages array
    const messages = [
      {
        role: 'user',
        content: conversationData.userMessage,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'assistant',
        content: conversationData.aiResponse,
        timestamp: new Date().toISOString(),
      },
    ]

    // Try to find existing conversation by session_id
    const { data: existing, error: fetchError } = await supabase
      .from('chat_conversations')
      .select('id, messages')
      .eq('session_id', conversationData.sessionId)
      .maybeSingle()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found, which is fine
      console.error('Supabase fetch conversation error:', fetchError)
      return { success: false, error: fetchError.message }
    }

    if (existing) {
      // Update existing conversation - append messages
      const updatedMessages = [...(existing.messages || []), ...messages]

      const { data, error } = await supabase
        .from('chat_conversations')
        .update({
          messages: updatedMessages,
          message_count: updatedMessages.length,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id')
        .single()

      if (error) {
        console.error('Supabase conversation update error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    } else {
      // Create new conversation
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert([
          {
            session_id: conversationData.sessionId,
            conversation_id: conversationData.sessionId,
            user_email: conversationData.userEmail || null,
            messages: messages,
            message_count: messages.length,
            metadata: conversationData.metadata || {},
            conversation_status: 'active',
            type: 'chat',
          },
        ])
        .select('id')
        .single()

      if (error) {
        console.error('Supabase conversation insert error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    }
  } catch (error) {
    console.error('Save conversation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Save a Stripe event for idempotency and auditing
 * @param {Object} stripeEvent - Stripe event payload
 * @returns {Promise<{success: boolean, id?: string, error?: string, duplicate?: boolean}>}
 */
export async function saveStripeEvent(stripeEvent) {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('stripe_events')
      .insert([
        {
          event_id: stripeEvent.id,
          type: stripeEvent.type,
          payload: stripeEvent,
          created_at: stripeEvent?.created
            ? new Date(stripeEvent.created * 1000).toISOString()
            : new Date().toISOString(),
        },
      ])
      .select('id')
      .single()

    if (error) {
      // Unique constraint violation (duplicate event) - treat as idempotent replay
      const isDuplicate =
        error.code === '23505' ||
        (typeof error.message === 'string' &&
          error.message.toLowerCase().includes('duplicate'))

      if (isDuplicate) {
        return { success: true, duplicate: true }
      }

      console.error('Supabase stripe event insert error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id, duplicate: false }
  } catch (error) {
    console.error('Save stripe event error:', error)
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
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('polar_events')
      .insert([
        {
          event_id: polarEvent.id,
          type: polarEvent.type,
          payload: polarEvent,
        },
      ])
      .select('id')
      .single()

    if (error) {
      // Unique constraint violation (duplicate event) - treat as idempotent replay
      const isDuplicate =
        error.code === '23505' ||
        (typeof error.message === 'string' &&
          error.message.toLowerCase().includes('duplicate'))

      if (isDuplicate) {
        return { success: true, duplicate: true }
      }

      console.error('Supabase polar event insert error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id, duplicate: false }
  } catch (error) {
    console.error('Save polar event error:', error)
    return { success: false, error: error.message }
  }
}

export default {
  getSupabaseClient,
  saveContact,
  saveDemoRequest,
  saveConversation,
  saveStripeEvent,
  savePolarEvent,
}
