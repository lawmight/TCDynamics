/**
 * Chat API Endpoint
 *
 * Vercel Serverless Function to handle chat interactions.
 * Logs conversations to Supabase for analytics and history.
 *
 * @module api/chat
 */

import { upsertChatConversation, getChatConversation } from './utils/supabase.js';

/**
 * Handle CORS headers
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

/**
 * Validate chat request data
 *
 * @param {Object} data - Request data to validate
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
function validateChatData(data) {
  const errors = [];

  if (!data.sessionId || typeof data.sessionId !== 'string') {
    errors.push('Session ID is required');
  }

  if (!data.messages || !Array.isArray(data.messages)) {
    errors.push('Messages must be an array');
  } else {
    // Validate message structure
    for (const msg of data.messages) {
      if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
        errors.push('Each message must have a valid role (user, assistant, or system)');
        break;
      }
      if (!msg.content || typeof msg.content !== 'string') {
        errors.push('Each message must have content');
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Handle GET request - Retrieve conversation history
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function handleGet(req, res) {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId parameter',
      });
    }

    const conversation = await getChatConversation(sessionId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });

  } catch (error) {
    console.error('Error retrieving conversation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation',
      message: error.message,
    });
  }
}

/**
 * Handle POST request - Send message and update conversation
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function handlePost(req, res) {
  try {
    const chatData = req.body;

    console.log('Received chat message:', {
      sessionId: chatData.sessionId,
      messageCount: chatData.messages?.length,
    });

    // Validate input
    const validation = validateChatData(chatData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Prepare metadata
    const metadata = {
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'],
      timestamp: new Date().toISOString(),
      ...chatData.metadata,
    };

    // Prepare conversation data
    const conversationData = {
      sessionId: chatData.sessionId,
      messages: chatData.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      })),
      userEmail: chatData.userEmail || null,
      metadata,
      status: chatData.status || 'active',
    };

    // Store/update in Supabase
    let dbRecord;
    try {
      dbRecord = await upsertChatConversation(conversationData);
      console.log('Chat conversation logged to Supabase:', dbRecord.id);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue processing even if logging fails
    }

    // TODO: Integrate with your AI chat service here
    // For now, return a mock response
    const assistantMessage = {
      role: 'assistant',
      content: 'Hello! I am the TC Dynamics assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    };

    // If we have a user message, provide a more contextual response
    const lastMessage = chatData.messages[chatData.messages.length - 1];
    if (lastMessage?.role === 'user') {
      assistantMessage.content = `Thank you for your message. I understand you said: "${lastMessage.content}". How can I assist you further?`;
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Chat message processed successfully',
      conversationId: dbRecord?.id,
      response: assistantMessage,
    });

  } catch (error) {
    console.error('Chat error:', error);

    // Return appropriate error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process chat message. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Main handler function
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route to appropriate handler
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET and POST requests',
    });
  }
}
