import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type ClientOrNull = SupabaseClient | null

let cached: ClientOrNull = null

const getEnv = (key: string) => import.meta.env[key]

export const getSupabaseClient = (): SupabaseClient => {
  if (cached) return cached

  const supabaseUrl = getEnv('VITE_SUPABASE_URL')
  const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }

  cached = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })

  return cached
}
