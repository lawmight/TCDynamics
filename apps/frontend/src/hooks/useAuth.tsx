import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { getSupabaseClient } from '@/lib/supabaseClient'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  authReady: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: { unsubscribe: () => void } | undefined

    const init = async () => {
      try {
        const supabase = getSupabaseClient()

        // If returning from OAuth redirect, exchange the code for a session before we gate routes.
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          const code = url.searchParams.get('code')
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            // Always clean URL to prevent retry loops
            url.searchParams.delete('code')
            url.searchParams.delete('state')
            const cleanUrl = `${url.pathname}${url.search}${url.hash}`
            window.history.replaceState({}, document.title, cleanUrl)

            if (error) {
              console.error('Auth code exchange failed', error)
              // Optionally: set an error state or redirect to login with error message
            }
          }
        }

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (!cancelled) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setAuthReady(true)
        }

        unsubscribe = supabase.auth.onAuthStateChange((_event, nextSession) => {
          if (cancelled) return
          setSession(nextSession)
          setUser(nextSession?.user ?? null)
          setLoading(false)
        }).data.subscription
      } catch (error) {
        console.error('Auth initialization failed', error)
        setAuthReady(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void init()

    return () => {
      cancelled = true
      unsubscribe?.unsubscribe()
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseClient()
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/app/chat`
        : undefined

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setSession(null)
  }, [])

  const refreshSession = useCallback(async () => {
    const supabase = getSupabaseClient()
    const {
      data: { session: currentSession },
      error,
    } = await supabase.auth.getSession()
    if (error) throw error
    setSession(currentSession)
    setUser(currentSession?.user ?? null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      authReady,
      signInWithGoogle,
      signOut,
      refreshSession,
    }),
    [
      authReady,
      loading,
      refreshSession,
      session,
      signInWithGoogle,
      signOut,
      user,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

export const useRequireAuth = () => {
  const navigate = useNavigate()
  const auth = useAuth()

  useEffect(() => {
    const hasAuthCode =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('code')

    if (!auth.loading && !auth.user && !hasAuthCode) {
      navigate('/login')
    }
  }, [auth.loading, auth.user, navigate])

  return auth
}
