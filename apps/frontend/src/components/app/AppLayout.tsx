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
import Settings from '~icons/lucide/settings'
import X from '~icons/lucide/x'
import Zap from '~icons/lucide/zap'

const navItems = [
  {
    to: '/app/chat',
    label: 'Assistant',
    icon: MessageSquare,
    description: 'Assistant IA',
  },
  {
    to: '/app/files',
    label: 'Base documentaire',
    icon: Folder,
    description: 'Documents et fichiers',
  },
  {
    to: '/app/analytics',
    label: 'Analyses',
    icon: BarChart3,
    description: "Indicateurs d'usage",
  },
  {
    to: '/app/settings',
    label: 'Parametres',
    icon: Settings,
    description: 'Configuration',
  },
]

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/app/chat': { title: 'Assistant IA', breadcrumb: 'Assistant' },
  '/app/files': { title: 'Base documentaire', breadcrumb: 'Documents' },
  '/app/analytics': { title: 'Analyses', breadcrumb: 'Analyses' },
  '/app/settings': { title: 'Parametres', breadcrumb: 'Parametres' },
  '/app/settings/email': {
    title: 'Preferences email',
    breadcrumb: 'Emails',
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
    'utilisateur'
  const displayName = user?.firstName || email.split('@')[0]
  const initials = displayName.slice(0, 2).toUpperCase()

  const pageInfo = pageTitles[location.pathname] || {
    title: 'Application',
    breadcrumb: 'Application',
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
            <p className="text-muted-foreground truncate text-xs">
              Espace de travail
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        className={cn(
          'flex-1 space-y-1 py-3',
          collapsed ? 'px-2' : 'px-3'
        )}
        aria-label="Navigation de l'application"
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
                    <span className="sr-only">Reduire la barre laterale</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>
                    Reduire la barre laterale{' '}
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
              className="bg-foreground/50 focus-visible:ring-ring focus-visible:ring-offset-background absolute inset-0 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={() => setMobileOpen(false)}
              onKeyDown={e => {
                if (e.key === 'Escape') setMobileOpen(false)
              }}
              role="button"
              tabIndex={0}
              aria-label="Fermer la navigation"
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
                    <span className="sr-only">Fermer</span>
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
              <span className="sr-only">Ouvrir la navigation</span>
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
                    <span className="sr-only">Developper la barre laterale</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Developper la barre laterale{' '}
                  <kbd className="ml-1 rounded border px-1 py-0.5 text-[10px]">
                    {'\u2318'}B
                  </kbd>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Breadcrumb */}
            <div className="flex h-8 items-center gap-1.5 text-sm">
              <Link
                to="/app"
                className="!min-h-0 !min-w-0 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
              >
                Application
              </Link>
              <span className="text-muted-foreground/50 leading-none">/</span>
              <span className="font-medium leading-none">{pageInfo.breadcrumb}</span>
            </div>

            <div className="flex-1" />

            {/* Mobile user button */}
            <div className="md:hidden">
              <UserButton
                afterSignOutUrl="/"
                appearance={getClerkAppearance(resolvedTheme)}
              />
            </div>
          </header>

          {/* Page content */}
          <div className="bg-muted/30 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 md:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
