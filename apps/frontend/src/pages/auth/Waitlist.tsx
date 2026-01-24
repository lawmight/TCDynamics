import { Waitlist as ClerkWaitlist } from '@clerk/clerk-react'

import { Card } from '@/components/ui/card'
import Sparkles from '~icons/lucide/sparkles'


const Waitlist = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <Card className="w-full max-w-md space-y-6 p-8 shadow-elegant">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">Join the Waitlist</h1>
          <p className="text-sm text-muted-foreground">
            Be among the first to experience TCDynamics WorkFlowAI. We'll notify
            you when it's your turn.
          </p>
        </div>

        <ClerkWaitlist
          afterJoinWaitlistUrl="/waitlist-success"
          signInUrl="/login"
        />
      </Card>
    </div>
  )
}

export default Waitlist
