import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
} from '@clerk/clerk-react'
import { ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card } from '@/components/ui/card'

const Login = () => {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/app/chat', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <Card className="w-full max-w-md space-y-6 p-8 shadow-elegant">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">Sign in to TCDynamics</h1>
          <p className="text-sm text-muted-foreground">
            Continue with your account to access chat, knowledge base, and
            analytics.
          </p>
        </div>
        <SignedOut>
          <SignInButton mode="redirect" redirectUrl="/app/chat">
            <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="text-center text-sm text-muted-foreground">
            Redirecting...
          </div>
        </SignedIn>
        <p className="text-center text-xs text-muted-foreground">
          Secure authentication via Clerk. You can manage your account settings
          at any time.
        </p>
      </Card>
    </div>
  )
}

export default Login
