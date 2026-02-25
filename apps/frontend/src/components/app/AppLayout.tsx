import { UserButton, useUser } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getClerkAppearance } from '@/config/clerkTheme'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import BarChart3 from '~icons/lucide/bar-chart-3'
import ChevronLeft from '~icons/lucide/chevron-left'
import Folder from '~icons/lucide/folder'
import Menu from '~icons/lucide/menu'
import MessageSquare from '~icons/lucide/message-square'
import PanelLeftClose from '~icons/lucide/panel-left-close'
import Search from '~icons/lucide/search'
import Settings from '~icons/lucide/settings'
import X from '~icons/lucide/x'
import Zap from '~icons/lucide/zap'

const navItems = [
  {
    to: '/app/chat',
    label: 'Chat',
    icon: MessageSquare,
    description: 'AI assistant',
  },
  {
    to: '/app/files',
    label: 'Knowledge Base',
    icon: Folder,
    description: 'Documents & files',
  },
  {
    to: '/app/analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Usage insights',
  },
  {
    to: '/app/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Configuration',
  },
]

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/app/chat': { title: 'Workspace Chat', breadcrumb: 'Chat' },
  '/app/files': { title: 'Knowledge Base', breadcrumb: 'Files' },
  '/app/analytics': { title: 'Analytics', breadcrumb: 'Analytics' },
  '/app/settings': { title: 'Settings', breadcrumb: 'Settings' },
  '/app/settings/email': {
    title: 'Email Preferences',
    breadcrumb: 'Email Preferences',
  },
}

export const AppLayout = () => {
  const { resolvedTheme } = useTheme()
  const { signOut: _signOut } = useAuth()
  const { user } = useUser()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    'user'
  const displayName = user?.firstName || email.split('@')[0]
  const initials = displayName.slice(0, 2).toUpperCase()

  const pageInfo = pageTitles[location.pathname] || {
    title: 'App',
    breadcrumb: 'App',
  }

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Brand */}
      <div
        className={cn(
          'border-sidebar-border flex items-center border-b',
          collapsed ? 'justify-center px-2 py-4' : 'gap-3 px-5 py-4'
        )}
      >
        <div className="bg-primary font-display text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
          <Zap className="size-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sidebar-foreground truncate text-sm font-semibold">
              TCDynamics
            </p>
            <p className="text-muted-foreground truncate text-xs">Workspace</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        className={cn(
          'flex-1 space-y-1 py-3',
          collapsed ? 'px-2' : 'px-3'
        )}
        aria-label="App navigation"
      >
        {navItems.map(item => {
          const Icon = item.icon
          return collapsed ? (
            <Tooltip key={item.to} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex size-10 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    )
                  }
                >
                  <Icon className="size-[18px]" />
                  <span className="sr-only">{item.label}</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p className="font-medium">{item.label}</p>
                <p className="text-muted-foreground text-xs">
                  {item.description}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )
              }
            >
              <Icon className="size-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          'border-sidebar-border border-t',
          collapsed ? 'px-2 py-3' : 'px-4 py-3'
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle />
            <UserButton
              afterSignOutUrl="/"
              appearance={getClerkAppearance(resolvedTheme)}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sidebar-foreground truncate text-sm font-medium">
                  {displayName}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {email}
                </p>
              </div>
              <UserButton
                afterSignOutUrl="/"
                appearance={getClerkAppearance(resolvedTheme)}
              />
            </div>
            <div className="mt-2 flex items-center gap-1.5 px-2">
              <ThemeToggle className="flex-1" />
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-8 shrink-0"
                    onClick={toggleSidebar}
                  >
                    <PanelLeftClose className="size-4" />
                    <span className="sr-only">Collapse sidebar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>
                    Collapse sidebar{' '}
                    <kbd className="ml-1 rounded border px-1 py-0.5 text-[10px]">
                      {'\u2318'}B
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </>
  )

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'bg-sidebar hidden shrink-0 flex-col transition-[width] duration-200 md:flex',
            sidebarCollapsed ? 'w-[60px]' : 'w-64'
          )}
        >
          <SidebarContent collapsed={sidebarCollapsed} />
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              onKeyDown={e => {
                if (e.key === 'Escape') setMobileOpen(false)
              }}
              role="button"
              tabIndex={0}
              aria-label="Close navigation"
            />
            <aside className="bg-sidebar animate-in slide-in-from-left absolute inset-y-0 left-0 w-64 shadow-xl duration-200">
              <div className="flex h-full flex-col">
                <div className="border-sidebar-border flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                      <Zap className="size-4" />
                    </div>
                    <span className="text-sm font-semibold">TCDynamics</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                <SidebarContent collapsed={false} />
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main
          id="main"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* Top header bar */}
          <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur">
            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
              <span className="sr-only">Open navigation</span>
            </Button>

            {/* Collapse trigger (desktop) */}
            {sidebarCollapsed && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden size-8 md:inline-flex"
                    onClick={toggleSidebar}
                  >
                    <ChevronLeft className="size-4 rotate-180" />
                    <span className="sr-only">Expand sidebar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Expand sidebar{' '}
                  <kbd className="ml-1 rounded border px-1 py-0.5 text-[10px]">
                    {'\u2318'}B
                  </kbd>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <Link
                to="/app"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                App
              </Link>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-medium">{pageInfo.breadcrumb}</span>
            </div>

            <div className="flex-1" />

            {/* Search hint */}
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hidden h-8 gap-2 md:flex"
              onClick={() => {
                /* placeholder for command palette */
              }}
            >
              <Search className="size-3.5" />
              <span className="text-xs">Search...</span>
              <kbd className="bg-muted text-muted-foreground pointer-events-none rounded border px-1.5 py-0.5 font-mono text-[10px]">
                {'\u2318'}K
              </kbd>
            </Button>

            {/* Mobile user button */}
            <div className="md:hidden">
              <UserButton
                afterSignOutUrl="/"
                appearance={getClerkAppearance(resolvedTheme)}
              />
            </div>
          </header>

          {/* Page content */}
          <div className="bg-muted/30 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
