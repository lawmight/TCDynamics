/**
 * GET /api/awaiting-summary
 * Counts of new contacts, pending demo requests, and recent Polar events.
 * Used by Cursor sessionStart hook to inject "awaiting" context.
 *
 * Auth: x-internal-token or Authorization: Bearer INTERNAL_HOOK_TOKEN
 */

import { Contact } from './_lib/models/Contact.js'
import { DemoRequest } from './_lib/models/DemoRequest.js'
import { PolarEvent } from './_lib/models/PolarEvent.js'
import { connectToDatabase } from './_lib/mongodb.js'

const TOKEN = process.env.INTERNAL_HOOK_TOKEN

function isAuthorized(req) {
  if (!TOKEN) return false
  const header =
    req.headers['x-internal-token'] ||
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  return header === TOKEN
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    await connectToDatabase()
  } catch (e) {
    return res.status(503).json({
      error: 'Database unavailable',
      message: e.message,
    })
  }

  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  try {
    const [contactsNew, contactsLast24h, demosPending, demosLast7d, polarLast24h, polarLast7d, polarByType] =
      await Promise.all([
        Contact.countDocuments({ status: 'new' }),
        Contact.countDocuments({ createdAt: { $gte: last24h } }),
        DemoRequest.countDocuments({ status: 'pending' }),
        DemoRequest.countDocuments({ createdAt: { $gte: last7d } }),
        PolarEvent.countDocuments({ createdAt: { $gte: last24h } }),
        PolarEvent.countDocuments({ createdAt: { $gte: last7d } }),
        PolarEvent.aggregate([
          { $match: { createdAt: { $gte: last24h } } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
      ])

    const byType = {}
    for (const r of polarByType) byType[r._id] = r.count

    return res.status(200).json({
      contacts: { new: contactsNew, last24h: contactsLast24h },
      demoRequests: { pending: demosPending, last7d: demosLast7d },
      polar: { last24h: polarLast24h, last7d: polarLast7d, byType },
    })
  } catch (e) {
    return res.status(500).json({
      error: 'Query failed',
      message: e.message,
    })
  }
}
