import { AnalyticsEvent } from './_lib/models/AnalyticsEvent.js'
import { verifyClerkAuth } from './_lib/auth.js'
import { ChatConversation } from './_lib/models/ChatConversation.js'
import { KnowledgeFile } from './_lib/models/KnowledgeFile.js'
import { connectToDatabase } from './_lib/mongodb.js'
import { withSentry } from './_lib/sentry.js'

/**
 * @security
 * Auth: Clerk JWT (`verifyClerkAuth`) required for GET/POST analytics data
 * Tenant isolation: all reads/writes are scoped by `clerkId` from JWT
 * Rate limit: N/A (authenticated endpoint)
 * Last audit: 2026-02-26 (Phase 4)
 */

/**
 * Consolidated Analytics API
 * Handles analytics events, stats, and health checks
 *
 * Usage:
 * - GET /api/analytics?health=true - Health check (simple status)
 * - GET /api/analytics - Get analytics summary stats
 * - POST /api/analytics - Record an analytics event
 */
async function handler(req, res) {
  // Health check endpoint (no database required)
  if (req.method === 'GET' && req.query.health === 'true') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment:
        process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
    })
  }

  // Connect to MongoDB with error handling
  try {
    await connectToDatabase()
  } catch (error) {
    console.error('MongoDB not configured:', error.message)
    return res.status(503).json({
      error: 'Analytics service unavailable',
      message: 'Database not configured',
    })
  }

  if (req.method === 'POST') {
    const { userId: clerkId, error: authError } = await verifyClerkAuth(
      req.headers.authorization
    )
    if (authError || !clerkId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { event, metadata } = req.body || {}
    if (!event) return res.status(400).json({ error: 'event is required' })

    try {
      await AnalyticsEvent.create({
        event,
        metadata: metadata || {},
        clerkId,
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Analytics capture error', error)
      return res.status(500).json({ error: 'Failed to record event' })
    }
  }

  if (req.method === 'GET') {
    const { userId: clerkId, error: authError } = await verifyClerkAuth(
      req.headers.authorization
    )
    if (authError || !clerkId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const [chatCount, uploadCount, eventCount] = await Promise.all([
        ChatConversation.countDocuments({ clerkId }),
        KnowledgeFile.countDocuments({ clerkId }),
        AnalyticsEvent.countDocuments({ clerkId }),
      ])

      return res.status(200).json({
        chatMessages: chatCount,
        uploads: uploadCount,
        // Endpoint is now user-scoped. Keep contract shape stable for frontend.
        activeUsers: chatCount > 0 || uploadCount > 0 || eventCount > 0 ? 1 : 0,
        avgLatencyMs: null, // TODO: Implement actual latency calculation
      })
    } catch (error) {
      console.error('Analytics summary error', error)
      return res.status(503).json({
        error: 'Analytics service unavailable',
        message: 'Database query failed',
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withSentry(handler)
