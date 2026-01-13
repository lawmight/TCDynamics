/**
 * Centralized Prompt Generation Module
 * 
 * Provides configurable prompt templates for AI interactions across the application.
 * Supports multiple prompt types and customization via environment variables.
 */

/**
 * Default system prompts for different use cases
 */
const DEFAULT_PROMPTS = {
  /**
   * Default chat assistant prompt (French)
   */
  chat: {
    fr: 'Tu es WorkFlowAI, assistant IA pour TCDynamics (PME FR). Réponds en français, professionnel et concis.',
    en: 'You are WorkFlowAI, an AI assistant for TCDynamics (French SMEs). Respond in French, professionally and concisely.',
  },
  /**
   * Default workspace chat prompt (English)
   */
  workspace: {
    en: 'You are a helpful AI assistant for TCDynamics WorkFlowAI. You help users with workflow automation, document analysis, and business process optimization. Respond professionally and concisely.',
    fr: 'Tu es un assistant IA utile pour TCDynamics WorkFlowAI. Tu aides les utilisateurs avec l\'automatisation des workflows, l\'analyse de documents et l\'optimisation des processus métier. Réponds de manière professionnelle et concise.',
  },
  /**
   * Generic assistant prompt
   */
  assistant: {
    en: 'You are a helpful AI assistant. Provide accurate, professional, and concise responses.',
    fr: 'Tu es un assistant IA utile. Fournis des réponses précises, professionnelles et concises.',
  },
}

/**
 * Get prompt configuration from environment variables
 */
function getPromptConfig() {
  const promptType = process.env.AI_PROMPT_TYPE || 'chat'
  const promptLanguage = process.env.AI_PROMPT_LANGUAGE || 'fr'
  const customPrompt = process.env.AI_CUSTOM_PROMPT

  return {
    type: promptType,
    language: promptLanguage,
    custom: customPrompt,
  }
}

/**
 * Generate system prompt based on configuration
 * 
 * @param {Object} options - Prompt generation options
 * @param {string} [options.type='chat'] - Prompt type (chat, workspace, assistant)
 * @param {string} [options.language='fr'] - Language preference (fr, en)
 * @param {string} [options.custom] - Custom prompt override
 * @returns {string} Generated system prompt
 */
export function generateSystemPrompt({
  type = 'chat',
  language = 'fr',
  custom,
} = {}) {
  // Use custom prompt if provided
  if (custom && typeof custom === 'string' && custom.trim()) {
    return custom.trim()
  }

  // Get prompt from environment config if available
  const config = getPromptConfig()
  if (config.custom) {
    return config.custom.trim()
  }

  // Use provided type/language or fall back to config
  const promptType = type || config.type
  const promptLang = language || config.language

  // Get prompt from defaults
  const promptSet = DEFAULT_PROMPTS[promptType] || DEFAULT_PROMPTS.chat
  const prompt = promptSet[promptLang] || promptSet.fr || promptSet.en

  return prompt
}

/**
 * Build messages array with system prompt
 * 
 * @param {Array} messages - Existing messages array
 * @param {Object} options - Prompt generation options
 * @returns {Array} Messages array with system prompt prepended if needed
 */
export function buildMessagesWithPrompt(messages = [], options = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages
  }

  // Check if system message already exists
  const hasSystemMessage = messages.some(msg => msg?.role === 'system')
  const systemMessageIndex = messages.findIndex(msg => msg?.role === 'system')

  // Generate system prompt
  const systemPrompt = generateSystemPrompt(options)

  // For Vertex AI, system messages are folded into user messages
  // For OpenAI, we can use system role
  const systemMessage = {
    role: 'system',
    content: systemPrompt,
  }

  // Force system prompt replacement if requested
  if (options.forceSystemPrompt && hasSystemMessage) {
    const updatedMessages = [...messages]
    updatedMessages[systemMessageIndex] = systemMessage
    return updatedMessages
  }

  // Prepend system message if not present
  if (!hasSystemMessage) {
    return [systemMessage, ...messages]
  }

  // If system message exists and we're not forcing, update it with generated prompt
  const updatedMessages = messages.map((msg, index) => {
    if (msg?.role === 'system' && index === systemMessageIndex) {
      return {
        ...msg,
        content: systemPrompt,
      }
    }
    return msg
  })

  return updatedMessages
}

/**
 * Get prompt metadata for logging/analytics
 * 
 * @param {Object} options - Prompt generation options
 * @returns {Object} Prompt metadata
 */
export function getPromptMetadata(options = {}) {
  const config = getPromptConfig()
  return {
    type: options.type || config.type,
    language: options.language || config.language,
    isCustom: !!config.custom,
    timestamp: new Date().toISOString(),
  }
}
