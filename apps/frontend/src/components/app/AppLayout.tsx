import { UserButton, useUser } from '@clerk/clerk-react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getClerkAppearance } from '@/config/clerkTheme'
import { useAuth } from '@/hooks/useAuth'
import BarChart3 from '~icons/lucide/bar-chart-3'
import Folder from '~icons/lucide/folder'
import LogOut from '~icons/lucide/log-out'
import MessageSquare from '~icons/lucide/message-square'
import Settings from '~icons/lucide/settings'

const navItems = [
  { to: '/app/chat', label: 'Chat', icon: MessageSquare },
  { to: '/app/files', label: 'Files / KB', icon: Folder },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

const baseNavClasses =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-muted hover:text-foreground'

export const AppLayout = () => {
  const { resolvedTheme } = useTheme()
  const { signOut } = useAuth()
  const { user } = useUser()

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    'user'
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col h-full">
          <div className="flex items-center gap-3 p-6">
            {/* eslint-disable-next-line tailwindcss/classnames-order */}
            <div className="flex size-10 items-center justify-center rounded-xl ring-1 ring-primary/30 bg-primary/10 text-primary font-semibold">
              TC
            </div>
            <div>
              <p className="text-sm text-muted-foreground">TCDynamics</p>
              <p className="text-base font-semibold">Workspace</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `${baseNavClasses} ${
                      isActive
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                        : 'text-muted-foreground'
                    }`
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="space-y-3 border-t border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line tailwindcss/classnames-order */}
                <div className="flex size-10 items-center justify-center rounded-full ring-1 ring-primary/30 bg-primary/10 text-primary font-semibold">
                  {initials}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">
                    {user?.primaryEmailAddress?.emailAddress ||
                      user?.emailAddresses[0]?.emailAddress ||
                      'Guest'}
                  </p>
                  <p className="text-muted-foreground">Clerk Auth</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <ThemeToggle className="w-full" />
              <div className="flex items-center">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={getClerkAppearance(resolvedTheme)}
                />
              </div>
            </div>
          </div>
        </aside>

        <main id="main" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-border p-4 md:hidden">
            <Link to="/app/chat" className="flex items-center gap-2">
              {/* eslint-disable-next-line tailwindcss/classnames-order */}
              <div className="flex size-9 items-center justify-center rounded-xl ring-1 ring-primary/30 bg-primary/10 text-primary font-semibold">
                TC
              </div>
              <div>
                <p className="text-xs text-muted-foreground">TCDynamics</p>
                <p className="text-sm font-semibold">Workspace</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => void signOut()}
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </Button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto scrollbar-hide bg-gradient-to-b from-background via-muted/40 to-background px-4 py-6 md:px-8">
            <div className="grid grid-cols-1 gap-4 md:hidden">
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold">
                      {user?.primaryEmailAddress?.emailAddress ||
                        user?.emailAddresses[0]?.emailAddress ||
                        'Guest'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {navItems.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex h-9 w-9 items-center justify-center rounded-md ${
                            isActive
                              ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                              : 'text-muted-foreground'
                          }`
                        }
                      >
                        <item.icon className="size-4" />
                      </NavLink>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
