import { useLocation } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * LandingSkeleton - For landing pages (/, /about, /demo, etc.)
 *
 * Structure: Hero section (above the fold) + feature sections
 * Matches Index.tsx layout with Hero component
 */
function LandingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - matches Hero.tsx min-h-screen centered layout */}
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          {/* Title - h1 like */}
          <Skeleton className="mx-auto h-12 w-3/4 md:h-16" />
          {/* Subtitle */}
          <Skeleton className="mx-auto h-6 w-2/3" delay={75} />
          <Skeleton className="mx-auto h-6 w-1/2" delay={100} />
          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Skeleton className="h-12 w-36 rounded-md" delay={150} />
            <Skeleton className="h-12 w-36 rounded-md" delay={200} />
          </div>
        </div>
      </section>

      {/* Feature sections - 3 bento-like blocks (per plan: "2 à 4") */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-48 rounded-xl" delay={100} />
          <Skeleton className="h-48 rounded-xl" delay={150} />
          <Skeleton className="h-48 rounded-xl" delay={200} />
        </div>
      </section>
    </div>
  )
}

/**
 * FormSkeleton - For form pages (checkout, login, waitlist)
 *
 * Structure: Centered card with title, fields, and button
 * Matches Checkout.tsx Card layout
 */
function FormSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 pt-6">
          {/* Title */}
          <Skeleton className="h-8 w-3/4" />
          {/* Subtitle / price */}
          <Skeleton className="h-5 w-1/2" delay={75} />

          {/* Form fields / features list */}
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full" delay={100} />
            <Skeleton className="h-4 w-5/6" delay={150} />
            <Skeleton className="h-4 w-4/5" delay={200} />
            <Skeleton className="h-4 w-full" delay={250} />
          </div>

          {/* Button */}
          <Skeleton className="h-11 w-full rounded-md" delay={300} />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * AppSkeleton - For /app routes (chat, files, analytics)
 *
 * Structure: Sidebar (w-72) + Main content area
 * Matches AppLayout.tsx exact dimensions to prevent layout shift
 */
function AppSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar - matches AppLayout aside: w-72, hidden md:flex */}
        <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col">
          {/* Logo + workspace name */}
          <div className="flex items-center gap-3 p-6">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-16" delay={75} />
            </div>
          </div>

          {/* Nav items - 4 items matching navItems array */}
          <nav className="flex-1 space-y-1 px-3">
            {[100, 150, 200, 250].map((delayMs, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md px-3 py-2"
              >
                <Skeleton className="size-4" delay={delayMs} />
                <Skeleton className="h-4 w-24" delay={delayMs + 25} />
              </div>
            ))}
          </nav>

          {/* User section at bottom */}
          <div className="space-y-3 border-t border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" delay={300} />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" delay={325} />
                <Skeleton className="h-3 w-16" delay={350} />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded-md" delay={375} />
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex min-h-screen flex-1 flex-col">
          {/* Mobile header - matches AppLayout header md:hidden */}
          <header className="flex items-center justify-between border-b border-border p-4 md:hidden">
            <div className="flex items-center gap-2">
              <Skeleton className="size-9 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-2 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-9 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </header>

          {/* Content area - matches AppLayout gradient background */}
          <div className="flex flex-1 flex-col gap-6 bg-gradient-to-b from-background via-muted/40 to-background px-4 py-6 md:px-8">
            {/* Mobile nav card - md:hidden */}
            <Card className="p-3 md:hidden">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-2 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="size-9 rounded-md" />
                  ))}
                </div>
              </div>
            </Card>

            {/* Main content cards */}
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <Skeleton className="h-6 w-48" delay={100} />
                  <Skeleton className="h-4 w-full" delay={150} />
                  <Skeleton className="h-4 w-3/4" delay={200} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <Skeleton className="h-6 w-36" delay={250} />
                  <Skeleton className="h-32 w-full rounded-md" delay={300} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * PageSkeleton - Route-aware skeleton loader
 *
 * Selects the appropriate skeleton based on current pathname:
 * - /app/* → AppSkeleton
 * - /checkout*, /login, /waitlist* → FormSkeleton
 * - Everything else → LandingSkeleton
 */
export function PageSkeleton() {
  const { pathname } = useLocation()

  // Determine skeleton type based on route
  const getSkeletonType = (): 'app' | 'form' | 'landing' => {
    if (pathname.startsWith('/app')) {
      return 'app'
    }

    const formRoutes = [
      '/checkout',
      '/checkout-enterprise',
      '/checkout-success',
      '/login',
      '/waitlist',
      '/waitlist-success',
    ]

    if (formRoutes.some(route => pathname.startsWith(route))) {
      return 'form'
    }

    return 'landing'
  }

  const skeletonType = getSkeletonType()

  return (
    <div
      role="status"
      aria-label="Loading page"
      aria-busy="true"
      className="duration-200 animate-in fade-in"
    >
      {skeletonType === 'app' && <AppSkeleton />}
      {skeletonType === 'form' && <FormSkeleton />}
      {skeletonType === 'landing' && <LandingSkeleton />}

      {/* Screen reader announcement */}
      <span className="sr-only">Loading page content, please wait.</span>
    </div>
  )
}

export default PageSkeleton
