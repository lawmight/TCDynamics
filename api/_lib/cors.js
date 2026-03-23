/**
 * CORS helper for Vercel serverless API routes
 * Wraps a handler to set CORS headers and handle OPTIONS preflight.
 *
 * When `credentials` is true the response MUST echo a specific origin
 * (wildcard `*` is invalid for credentialed requests per the Fetch spec).
 * Pass `allowedOrigins` for dynamic validation or a fixed `origin` string.
 *
 * @param {(req, res) => Promise<any>} handler
 * @param {{
 *   methods?:        string[],
 *   headers?:        string,
 *   credentials?:    boolean,
 *   origin?:         string,
 *   allowedOrigins?: string[],
 * }} [opts]
 */
export function allowCors(handler, opts = {}) {
  const {
    methods = ['GET', 'OPTIONS'],
    headers = 'Content-Type, Authorization',
    credentials = true,
    origin,
    allowedOrigins,
  } = opts

  const methodsStr = Array.isArray(methods) ? methods.join(',') : methods

  const allowedSet =
    allowedOrigins && allowedOrigins.length > 0
      ? new Set(allowedOrigins)
      : null

  function resolveOrigin(req) {
    const reqOrigin = req.headers.origin

    if (allowedSet) {
      if (reqOrigin && allowedSet.has(reqOrigin)) return reqOrigin
      if (
        process.env.NODE_ENV !== 'production' &&
        reqOrigin &&
        isLocalhostOrigin(reqOrigin)
      ) {
        return reqOrigin
      }
      return allowedOrigins[0]
    }

    if (origin && origin !== '*') return origin

    if (credentials && reqOrigin) return null

    return '*'
  }

  return async (req, res) => {
    const resolved = resolveOrigin(req)
    res.setHeader('Access-Control-Allow-Credentials', credentials ? 'true' : 'false')
    if (resolved !== null) {
      res.setHeader('Access-Control-Allow-Origin', resolved)
    }
    res.setHeader('Access-Control-Allow-Methods', methodsStr)
    res.setHeader('Access-Control-Allow-Headers', headers)

    if (allowedSet || (!origin && credentials)) {
      res.setHeader('Vary', 'Origin')
    }

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    return handler(req, res)
  }
}

function isLocalhostOrigin(origin) {
  try {
    const { hostname } = new URL(origin)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

export default { allowCors }
