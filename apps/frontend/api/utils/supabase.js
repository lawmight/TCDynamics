/**
 * Supabase Client Utility
 *
 * Provides a configured Supabase client for serverless functions.
 * Uses environment variables for configuration.
 *
 * @module api/utils/supabase
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Get Supabase client instance
 *
 * Creates a Supabase client with appropriate credentials based on use case.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.useServiceRole - Whether to use service role key (for admin operations)
 * @returns {Object} Configured Supabase client
 * @throws {Error} If required environment variables are missing
 */
export function getSupabaseClient({ useServiceRole = false } = {}) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = useServiceRole
    ? process.env.SUPABASE_SERVICE_KEY
    : process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set');
  }

  if (!supabaseKey) {
    const keyType = useServiceRole ? 'SUPABASE_SERVICE_KEY' : 'SUPABASE_ANON_KEY';
    throw new Error(`${keyType} environment variable is not set`);
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Serverless functions don't need session persistence
      autoRefreshToken: false,
    },
  });
}

/**
 * Insert a contact form submission
 *
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Contact name
 * @param {string} contactData.email - Contact email
 * @param {string} [contactData.company] - Company name
 * @param {string} [contactData.phone] - Phone number
 * @param {string} contactData.message - Message content
 * @param {string} [contactData.source] - Source of the contact (default: 'website')
 * @returns {Promise<Object>} Inserted contact record
 * @throws {Error} If insertion fails
 */
export async function insertContact(contactData) {
  const supabase = getSupabaseClient({ useServiceRole: false });

  const { data, error } = await supabase
    .from('contacts')
    .insert([{
      name: contactData.name,
      email: contactData.email,
      company: contactData.company || null,
      phone: contactData.phone || null,
      message: contactData.message,
      source: contactData.source || 'website',
      status: 'new',
    }])
    .select()
    .single();

  if (error) {
    console.error('Supabase error inserting contact:', error);
    throw new Error(`Failed to insert contact: ${error.message}`);
  }

  return data;
}

/**
 * Insert a demo request submission
 *
 * @param {Object} demoData - Demo request data
 * @param {string} demoData.name - Requester name
 * @param {string} demoData.email - Requester email
 * @param {string} demoData.company - Company name
 * @param {string} [demoData.phone] - Phone number
 * @param {string} [demoData.jobTitle] - Job title
 * @param {string} [demoData.companySize] - Company size range
 * @param {string} [demoData.industry] - Industry
 * @param {string} [demoData.useCase] - Use case description
 * @param {string} [demoData.timeline] - Implementation timeline
 * @param {string} [demoData.message] - Additional message
 * @param {string} [demoData.preferredDate] - Preferred demo date
 * @returns {Promise<Object>} Inserted demo request record
 * @throws {Error} If insertion fails
 */
export async function insertDemoRequest(demoData) {
  const supabase = getSupabaseClient({ useServiceRole: false });

  const { data, error } = await supabase
    .from('demo_requests')
    .insert([{
      name: demoData.name,
      email: demoData.email,
      company: demoData.company,
      phone: demoData.phone || null,
      job_title: demoData.jobTitle || null,
      company_size: demoData.companySize || null,
      industry: demoData.industry || null,
      use_case: demoData.useCase || null,
      timeline: demoData.timeline || null,
      message: demoData.message || null,
      preferred_date: demoData.preferredDate || null,
      status: 'pending',
    }])
    .select()
    .single();

  if (error) {
    console.error('Supabase error inserting demo request:', error);
    throw new Error(`Failed to insert demo request: ${error.message}`);
  }

  return data;
}

/**
 * Insert or update a chat conversation
 *
 * @param {Object} chatData - Chat conversation data
 * @param {string} chatData.sessionId - Session ID
 * @param {Array} chatData.messages - Array of message objects
 * @param {string} [chatData.userEmail] - User email (if available)
 * @param {Object} [chatData.metadata] - Additional metadata
 * @returns {Promise<Object>} Upserted chat conversation record
 * @throws {Error} If operation fails
 */
export async function upsertChatConversation(chatData) {
  const supabase = getSupabaseClient({ useServiceRole: false });

  // First, try to find existing conversation
  const { data: existing } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('session_id', chatData.sessionId)
    .single();

  if (existing) {
    // Update existing conversation
    const { data, error } = await supabase
      .from('chat_conversations')
      .update({
        messages: chatData.messages,
        last_message_at: new Date().toISOString(),
        message_count: chatData.messages.length,
        conversation_status: chatData.status || 'active',
        user_email: chatData.userEmail || existing.user_email,
        metadata: chatData.metadata || existing.metadata,
      })
      .eq('session_id', chatData.sessionId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating chat conversation:', error);
      throw new Error(`Failed to update chat conversation: ${error.message}`);
    }

    return data;
  } else {
    // Insert new conversation
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert([{
        session_id: chatData.sessionId,
        messages: chatData.messages,
        user_email: chatData.userEmail || null,
        metadata: chatData.metadata || null,
        message_count: chatData.messages.length,
        conversation_status: chatData.status || 'active',
        last_message_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting chat conversation:', error);
      throw new Error(`Failed to insert chat conversation: ${error.message}`);
    }

    return data;
  }
}

/**
 * Get a chat conversation by session ID
 *
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Chat conversation record or null if not found
 */
export async function getChatConversation(sessionId) {
  const supabase = getSupabaseClient({ useServiceRole: false });

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Supabase error getting chat conversation:', error);
    throw new Error(`Failed to get chat conversation: ${error.message}`);
  }

  return data;
}

export default getSupabaseClient;
