import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import type { User } from '@clerk/clerk-react'

// Adapter type to maintain compatibility with existing code
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

/**
 * Custom hook that wraps Clerk's auth hooks for authentication
 */
export const useAuth = (): AuthContextType => {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth()
  const { user } = useUser()

  const signInWithGoogle = async () => {
    // Clerk handles OAuth redirects automatically via SignInButton component
    // This function is kept for compatibility but should use SignInButton instead
    throw new Error(
      'Use Clerk SignInButton component instead of signInWithGoogle function'
    )
  }

  const refreshSession = async () => {
    // Clerk handles session refresh automatically
    // This is a no-op for compatibility
  }

  // Create a session-like object for compatibility
  const session = isSignedIn && user
    ? {
        access_token: undefined, // Use getToken() instead
        id: user.id,
      }
    : null

  return {
    user: user ?? null,
    session,
    loading: !isLoaded,
    authReady: isLoaded,
    signInWithGoogle,
    signOut,
    refreshSession,
    getToken,
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
