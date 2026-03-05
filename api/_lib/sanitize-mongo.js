/**
 * Recursively strips MongoDB operators from objects.
 * Keys starting with "$" are removed to block operator injection.
 *
 * @param {unknown} input
 * @returns {unknown}
 */
export function sanitizeMongoInput(input) {
  if (input === null || input === undefined) return input

  if (
    typeof input === 'string' ||
    typeof input === 'number' ||
    typeof input === 'boolean'
  ) {
    return input
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeMongoInput(item))
  }

  if (typeof input === 'object') {
    const clean = {}
    for (const key of Object.keys(input)) {
      if (key.startsWith('$')) continue
      clean[key] = sanitizeMongoInput(input[key])
    }
    return clean
  }

  return input
}

/**
 * Ensures a value is a plain string.
 * Returns null for any non-string value.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
export function ensureString(value) {
  if (typeof value === 'string') return value
  return null
}
