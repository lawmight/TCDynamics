import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ArrowLeft from '~icons/lucide/arrow-left'
import CheckCircle2 from '~icons/lucide/check-circle-2'

const WaitlistSuccess = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <Card className="w-full max-w-md space-y-6 p-8 text-center shadow-elegant">
        <div className="space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-2xl font-semibold">You're on the list!</h1>
          <p className="text-muted-foreground">
            Thanks for joining the TCDynamics waitlist. We'll send you an email
            when it's your turn to get started.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            In the meantime, feel free to explore our features and learn more
            about what TCDynamics can do for your business.
          </p>

          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 size-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default WaitlistSuccess
