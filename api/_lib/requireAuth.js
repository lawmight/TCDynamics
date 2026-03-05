import { verifyClerkAuth } from './auth.js'
import { connectToDatabase } from './mongodb.js'
import { User } from './models/User.js'

function defaultFindUserByClerkId(clerkId) {
  return User.findOne({ clerkId })
}

/**
 * Wrap API handlers with Clerk authentication and optional plan checks.
 * @param {(req: any, res: any) => Promise<unknown>} handler
 * @param {{ requiredPlans?: string[] }} [options]
 * @param {{
 *   verifyAuth?: (authHeader: string | undefined) => Promise<{ userId: string | null, error: string | null }>,
 *   connectDb?: () => Promise<unknown>,
 *   findUserByClerkId?: (clerkId: string) => Promise<{ plan?: string } | null>,
 * }} [dependencies]
 */
export function requireAuth(handler, options = {}, dependencies = {}) {
  const { requiredPlans } = options
  const verifyAuth = dependencies.verifyAuth || verifyClerkAuth
  const connectDb = dependencies.connectDb || connectToDatabase
  const findUserByClerkId =
    dependencies.findUserByClerkId || defaultFindUserByClerkId

  return async (req, res) => {
    const { userId: clerkId, error } = await verifyAuth(req.headers.authorization)
    if (error || !clerkId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    req.clerkId = clerkId

    if (requiredPlans?.length) {
      await connectDb()
      const user = await findUserByClerkId(clerkId)
      if (!user || !requiredPlans.includes(user.plan)) {
        return res.status(403).json({
          error: 'Upgrade required',
          requiredPlan: requiredPlans[0],
        })
      }
      req.user = user
    }

    return handler(req, res)
  }
}
