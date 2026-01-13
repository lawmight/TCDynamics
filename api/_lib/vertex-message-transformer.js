/**
 * Vertex AI Message Transformer
 * 
 * Transforms messages from various formats (OpenAI-style, Vertex format, etc.)
 * into Vertex AI's expected format for generateContent API.
 */

/**
 * Converts a value to a safe text string
 * @param {unknown} value - Value to convert
 * @returns {string} Safe text representation
 */
export const toSafeText = value => {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

/**
 * Normalizes a message entry into Vertex AI parts format
 * Handles strings, numbers, booleans, arrays, objects, and multimodal content
 * @param {unknown} entry - Message entry to normalize
 * @param {Array} parts - Array to accumulate parts into
 */
export const normalizeEntryToParts = (entry, parts) => {
  if (entry === undefined || entry === null) return

  // Strings, numbers, booleans -> text part
  if (
    typeof entry === 'string' ||
    typeof entry === 'number' ||
    typeof entry === 'boolean'
  ) {
    const text = toSafeText(entry)
    if (text) parts.push({ text })
    return
  }

  // Arrays -> normalize each element
  if (Array.isArray(entry)) {
    entry.forEach(item => normalizeEntryToParts(item, parts))
    return
  }

  if (typeof entry === 'object') {
    // Inline/file data already in Vertex format
    if (entry.inlineData?.mimeType && entry.inlineData?.data) {
      parts.push({ inlineData: entry.inlineData })
      return
    }
    if (entry.fileData?.fileUri) {
      parts.push({ fileData: entry.fileData })
      return
    }

    // Common OpenAI-style multimodal payloads
    if (entry.type === 'image_url' && entry.image_url?.url) {
      parts.push({ fileData: { fileUri: entry.image_url.url } })
      return
    }

    // Nested parts array -> flatten safely
    if (Array.isArray(entry.parts)) {
      entry.parts.forEach(item => normalizeEntryToParts(item, parts))
      return
    }

    // Objects with text content
    if (typeof entry.text === 'string') {
      const text = entry.text
      if (text) parts.push({ text })
      return
    }

    // Fallback: stringify object to text
    const text = toSafeText(entry)
    if (text) parts.push({ text })
    return
  }

  // Fallback for any other type
  const text = toSafeText(entry)
  if (text) parts.push({ text })
}

/**
 * Maps message roles from OpenAI/standard format to Vertex AI format
 * @param {string} role - Original role (user, assistant, system)
 * @returns {string} Vertex AI role (user, model)
 */
export const mapRole = role => {
  if (role === 'assistant') return 'model'
  // Vertex generateContent does not use a dedicated system role; fold into user
  if (role === 'system') return 'user'
  return 'user'
}

/**
 * Filters and cleans parts to ensure they're valid for Vertex AI
 * Removes empty text parts and ensures all parts are non-null
 * @param {Array} parts - Parts array to filter
 * @returns {Array} Filtered parts array
 */
export const filterParts = parts => {
  return parts
    .map(part => {
      if (typeof part?.text === 'string') {
        const text = part.text.trim()
        return text ? { text } : null
      }
      return part
    })
    .filter(Boolean)
}

/**
 * Transforms an array of messages into Vertex AI contents format
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Array} Vertex AI contents array
 */
export const transformMessagesToContents = messages => {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array')
  }

  const contents = messages
    .map(msg => {
      if (!msg || typeof msg !== 'object') {
        return null
      }

      const parts = []
      normalizeEntryToParts(msg?.content, parts)

      // Drop empty text parts to avoid Vertex rejection
      const filteredParts = filterParts(parts)

      // Skip messages with no usable content
      if (filteredParts.length === 0) return null

      return {
        role: mapRole(msg?.role),
        parts: filteredParts,
      }
    })
    .filter(Boolean)

  return contents
}
