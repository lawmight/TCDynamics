import { type User, useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type AuthContextType = {
  user: User | null
  session: { access_token?: string; id?: string } | null
  loading: boolean
  authReady: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  getToken: () => Promise<string | null>
  isSignedIn: boolean | undefined
}

const noopAsync = async () => {}

const FALLBACK_AUTH: AuthContextType = {
  user: null,
  session: null,
  loading: false,
  authReady: true,
  signInWithGoogle: noopAsync,
  signOut: noopAsync,
  refreshSession: noopAsync,
  getToken: async () => null,
  isSignedIn: false,
}

/**
 * Custom hook that wraps Clerk's auth hooks for authentication.
 * Returns safe defaults when Clerk is not available (development mode).
 */
export const useAuth = (): AuthContextType => {
  const [clerkUnavailable, setClerkUnavailable] = useState(false)

  let clerkAuth: ReturnType<typeof useClerkAuth> | null = null
  let clerkUser: ReturnType<typeof useUser> | null = null

  // eslint-disable-next-line react-hooks/rules-of-hooks -- hooks always called, error caught via state
  try { clerkAuth = useClerkAuth() } catch { setClerkUnavailable(true) }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  try { clerkUser = useUser() } catch { setClerkUnavailable(true) }

  if (clerkUnavailable || !clerkAuth || !clerkUser) {
    if (import.meta.env.DEV) {
      console.warn('[Auth] Clerk not available, using mock auth state')
    }
    return FALLBACK_AUTH
  }

  const { isLoaded, isSignedIn, getToken, signOut } = clerkAuth
  const { user } = clerkUser

  const signInWithGoogle = async () => {
    throw new Error(
      'Use Clerk SignInButton component instead of signInWithGoogle function'
    )
  }

  const session =
    isSignedIn && user
      ? { access_token: undefined, id: user.id }
      : null

  const getFreshToken = async (): Promise<string | null> => {
    try {
      return await getToken()
    } catch (_err) {
      if (import.meta.env.DEV) {
        console.warn('[Clerk Dev] Token retrieval failed:', _err)
      }
      return null
    }
  }

  return {
    user: user ?? null,
    session,
    loading: !isLoaded,
    authReady: isLoaded,
    signInWithGoogle,
    signOut,
    refreshSession: noopAsync,
    getToken: getFreshToken,
    isSignedIn,
  }
}

export const useRequireAuth = () => {
  const navigate = useNavigate()
  const auth = useAuth()

  useEffect(() => {
    if (!auth.loading && !auth.isSignedIn) {
      navigate('/login')
    }
  }, [auth.loading, auth.isSignedIn, navigate])

  return auth
}
