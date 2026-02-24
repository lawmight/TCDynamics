import { type User, useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
 * Returns safe defaults when Clerk is not available (development mode)
 */
export const useAuth = (): AuthContextType => {
  try {
    const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth()
    const { user } = useUser()

    const signInWithGoogle = async () => {
      throw new Error(
        'Use Clerk SignInButton component instead of signInWithGoogle function'
      )
    }

    const refreshSession = async () => {
      // Clerk handles session refresh automatically
      // This is a no-op for compatibility
    }

    const session =
      isSignedIn && user
        ? {
            access_token: undefined,
            id: user.id,
          }
        : null

    const getFreshToken = async (): Promise<string | null> => {
      try {
        const token = await getToken()
        return token
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(
            '[Clerk Dev] Token retrieval failed - session may have expired:',
            error
          )
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
      refreshSession,
      getToken: getFreshToken,
      isSignedIn,
    }
  } catch (error) {
    // Clerk not available (development mode without Clerk configured)
    if (import.meta.env.DEV) {
      console.warn('[Auth] Clerk not available, using mock auth state')
    }
    const noopAsync = async () => {}
    return {
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
