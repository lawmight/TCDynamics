import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitizes a string input using DOMPurify to prevent XSS attacks.
 * Non-string values are returned unchanged.
 *
 * @param {unknown} str - The value to sanitize
 * @returns {string|unknown} Sanitized string or original value
 *
 * @example
 * sanitizeString('<script>alert("xss")</script>') // ''
 * sanitizeString('Hello world') // 'Hello world'
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str
  return DOMPurify.sanitize(str)
}
