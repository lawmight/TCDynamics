/**
 * Raw body utilities for webhooks and signature verification
 * Use when bodyParser is disabled and raw Buffer is required (e.g. Svix, Polar)
 */

/**
 * Read raw body as Buffer for signature verification
 * Required when api: { bodyParser: false }
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Buffer>}
 */
export async function getRawBody(req) {
  if (req.body && typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8')
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export default { getRawBody }
