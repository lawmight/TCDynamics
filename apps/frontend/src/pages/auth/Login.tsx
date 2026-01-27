import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card } from '@/components/ui/card'
import ShieldCheck from '~icons/lucide/shield-check'

const Login = () => {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/app/chat', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div className="bg-gradient-hero flex min-h-screen items-center justify-center px-4">
      <Card className="shadow-elegant w-full max-w-md space-y-6 p-8">
        <div className="space-y-2 text-center">
          <div className="bg-primary/10 text-primary ring-primary/30 mx-auto flex size-12 items-center justify-center rounded-2xl ring-1">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold">Sign in to TCDynamics</h1>
          <p className="text-muted-foreground text-sm">
            Continue with your account to access chat, knowledge base, and
            analytics.
          </p>
        </div>
        <SignedOut>
          <SignInButton mode="redirect" redirectUrl="/app/chat">
            <button className="bg-primary hover:bg-primary/90 focus:ring-primary/50 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="text-muted-foreground text-center text-sm">
            Redirecting...
          </div>
        </SignedIn>
        <p className="text-muted-foreground text-center text-xs">
          Secure authentication via Clerk. You can manage your account settings
          at any time.
        </p>
      </Card>
    </div>
  )
}

export default Login
