import { LogIn, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

const Login = () => {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      navigate('/app/chat', { replace: true })
    }
  }, [loading, navigate, user])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <Card className="w-full max-w-md space-y-6 p-8 shadow-elegant">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">Sign in to TCDynamics</h1>
          <p className="text-sm text-muted-foreground">
            Continue with your Google account to access chat, knowledge base,
            and analytics.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={async () => {
            setError(null)
            try {
              await signInWithGoogle()
            } catch (err) {
              const message =
                err instanceof Error ? err.message : 'Login failed'
              setError(message)
            }
          }}
          disabled={loading}
        >
          {loading ? (
            <>Loading...</>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Continue with Google
            </>
          )}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-center text-xs text-muted-foreground">
          Single-sign-on via Supabase Google OAuth. You can revoke access at any
          time from your Google account.
        </p>
      </Card>
    </div>
  )
}

export default Login
