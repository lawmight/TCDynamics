import { getSupabaseClient } from './_lib/supabase.js'

export default async function handler(_req, res) {
  try {
    const { page = 1, limit = 50 } = _req.query
    const offset = (page - 1) * limit

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('knowledge_files')
      .select('id, name, path, size, mime_type, summary, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('List files error', error)
      return res.status(500).json({ error: 'Failed to list files' })
    }

    const files =
      data?.map(item => ({
        id: item.id || item.path,
        name: item.name,
        path: item.path,
        size: item.size || 0,
        mimeType: item.mime_type,
        summary: item.summary,
        createdAt: item.created_at,
      })) || []

    return res.status(200).json({ files })
  } catch (error) {
    console.error('Files list error', error)
    return res.status(500).json({ error: 'Internal error' })
  }
}
