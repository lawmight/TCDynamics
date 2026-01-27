/**
 * CORS helper for Vercel serverless API routes
 * Wraps a handler to set CORS headers and handle OPTIONS
 *
 * @param {(req, res) => Promise<any>} handler - API handler
 * @param {{ methods?: string[], headers?: string, credentials?: boolean, origin?: string }} [opts]
 * @returns {(req, res) => Promise<any>}
 */
export function allowCors(handler, opts = {}) {
  const {
    methods = ['GET', 'OPTIONS'],
    headers = 'Content-Type, Authorization',
    credentials = true,
    origin = '*',
  } = opts

  const methodsStr = Array.isArray(methods) ? methods.join(',') : methods

  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', credentials ? 'true' : 'false')
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', methodsStr)
    res.setHeader('Access-Control-Allow-Headers', headers)

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    return handler(req, res)
  }
}

export default { allowCors }
