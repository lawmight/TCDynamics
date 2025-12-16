import { getSupabaseClient } from './_lib/supabase.js'

export default async function handler(req, res) {
  // Get Supabase client with error handling
  let supabase
  try {
    supabase = getSupabaseClient()
  } catch (error) {
    console.error('Supabase not configured:', error.message)
    // Return consistent error for both GET and POST when database is unavailable
    return res.status(503).json({
      error: 'Analytics service unavailable',
      message: 'Database not configured',
    })
  }

  if (req.method === 'POST') {
    const { event, metadata } = req.body || {}
    if (!event) return res.status(400).json({ error: 'event is required' })

    try {
      const { error } = await supabase.from('analytics_events').insert({
        event,
        metadata: metadata || {},
      })

      if (error) {
        console.warn('Analytics insert error', error)
        return res.status(500).json({ error: 'Failed to record event' })
      }

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Analytics capture error', error)
      return res.status(500).json({ error: 'Failed to record event' })
    }
  }

  if (req.method === 'GET') {
    try {
      const [chatResult, uploadResult, userResult] = await Promise.all([
        supabase
          .from('chat_conversations')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('knowledge_files')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('analytics_events')
          .select('user_id', { count: 'exact', head: true }),
      ])

      return res.status(200).json({
        chatMessages: chatResult.count || 0,
        uploads: uploadResult.count || 0,
        activeUsers: userResult.count || 0,
        avgLatencyMs: null, // TODO: Implement actual latency calculation
      })
    } catch (error) {
      console.error('Analytics summary error', error)
      // Return consistent error when database query fails
      return res.status(503).json({
        error: 'Analytics service unavailable',
        message: 'Database not configured',
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
