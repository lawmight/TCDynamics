const { doubleCsrf } = require('csrf-csrf')

// Configure CSRF protection
const doubleCsrfOptions = {
  getSecret: () =>
    process.env.SESSION_SECRET || 'default-secret-change-in-production',
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: req => {
    return req.headers['x-csrf-token'] || req.body._csrf
  },
}

const { generateToken, validateRequest, doubleCsrfProtection } =
  doubleCsrf(doubleCsrfOptions)

// Middleware to generate and send CSRF token
const csrfToken = (req, res, next) => {
  const token = generateToken(res, req)
  res.locals.csrfToken = token
  next()
}

// Middleware to validate CSRF token
const csrfProtection = (req, res, next) => {
  // Skip CSRF for certain routes if needed
  const skipRoutes = ['/health', '/api/test']
  if (skipRoutes.includes(req.path)) {
    return next()
  }

  doubleCsrfProtection(req, res, next)
}

module.exports = {
  csrfToken,
  csrfProtection,
  generateToken,
  validateRequest,
}
