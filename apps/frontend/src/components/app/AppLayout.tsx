import {
  BarChart3,
  Folder,
  LogOut,
  MessageSquare,
  Moon,
  Sun,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/app/chat', label: 'Chat', icon: MessageSquare },
  { to: '/app/files', label: 'Files / KB', icon: Folder },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
]

const baseNavClasses =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-muted hover:text-foreground'

export const AppLayout = () => {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const { user, signOut } = useAuth()

  const initials = useMemo(() => {
    const email = user?.email || 'user'
    return email.slice(0, 2).toUpperCase()
  }, [user?.email])

  const toggleTheme = () =>
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-shrink-0 border-r border-border bg-sidebar md:flex md:flex-col">
          <div className="flex items-center gap-3 px-6 py-6">
            {/* eslint-disable-next-line tailwindcss/classnames-order */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-primary/30 bg-primary/10 text-primary font-semibold">
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
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="space-y-3 border-t border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line tailwindcss/classnames-order */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-primary/30 bg-primary/10 text-primary font-semibold">
                  {initials}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{user?.email || 'Guest'}</p>
                  <p className="text-muted-foreground">Google OAuth</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="w-full"
              >
                {resolvedTheme === 'dark' ? (
                  <div className="flex w-full items-center justify-center gap-2">
                    <Sun className="h-4 w-4" /> Light
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-center gap-2">
                    <Moon className="h-4 w-4" /> Dark
                  </div>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void signOut()}
                className="w-full text-destructive hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-4 py-4 md:hidden">
            <Link to="/app/chat" className="flex items-center gap-2">
              {/* eslint-disable-next-line tailwindcss/classnames-order */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-primary/30 bg-primary/10 text-primary font-semibold">
                TC
              </div>
              <div>
                <p className="text-xs text-muted-foreground">TCDynamics</p>
                <p className="text-sm font-semibold">Workspace</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 bg-gradient-to-b from-background via-muted/40 to-background px-4 py-6 md:px-8">
            <div className="grid grid-cols-1 gap-4 md:hidden">
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold">
                      {user?.email || 'Guest'}
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
                        <item.icon className="h-4 w-4" />
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
