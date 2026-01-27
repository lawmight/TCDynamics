import { Waitlist as ClerkWaitlist } from '@clerk/clerk-react'

import { Card } from '@/components/ui/card'
import Sparkles from '~icons/lucide/sparkles'

const Waitlist = () => {
  return (
    <div className="bg-gradient-hero flex min-h-screen items-center justify-center px-4">
      <Card className="shadow-elegant w-full max-w-md space-y-6 p-8">
        <div className="space-y-2 text-center">
          <div className="bg-primary/10 text-primary ring-primary/30 mx-auto flex size-12 items-center justify-center rounded-2xl ring-1">
            <Sparkles className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold">Join the Waitlist</h1>
          <p className="text-muted-foreground text-sm">
            Be among the first to experience TCDynamics. We'll notify you when
            it's your turn.
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
