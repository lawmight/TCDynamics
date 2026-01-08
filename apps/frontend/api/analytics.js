import { AnalyticsEvent } from './_lib/models/AnalyticsEvent.js'
import { ChatConversation } from './_lib/models/ChatConversation.js'
import { KnowledgeFile } from './_lib/models/KnowledgeFile.js'
import { connectToDatabase } from './_lib/mongodb.js'

/**
 * Consolidated Analytics API
 * Handles analytics events, stats, and health checks
 *
 * Usage:
 * - GET /api/analytics?health=true - Health check (simple status)
 * - GET /api/analytics - Get analytics summary stats
 * - POST /api/analytics - Record an analytics event
 */
export default async function handler(req, res) {
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
    const { event, metadata, clerkId } = req.body || {}
    if (!event) return res.status(400).json({ error: 'event is required' })

    try {
      await AnalyticsEvent.create({
        event,
        metadata: metadata || {},
        clerkId: clerkId || null,
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Analytics capture error', error)
      return res.status(500).json({ error: 'Failed to record event' })
    }
  }

  if (req.method === 'GET') {
    try {
      const [chatCount, uploadCount, uniqueUserIds] = await Promise.all([
        ChatConversation.countDocuments({}),
        KnowledgeFile.countDocuments({}),
        AnalyticsEvent.distinct('clerkId'),
      ])

      return res.status(200).json({
        chatMessages: chatCount,
        uploads: uploadCount,
        activeUsers: uniqueUserIds.filter(id => id !== null).length,
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
