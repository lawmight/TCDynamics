import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

import { Button } from './button'

export interface ThemeToggleProps {
  className?: string
}

/**
 * ThemeToggle component for switching between light, dark, and system themes
 *
 * Features:
 * - Cycles through light → dark → system → light
 * - Visual icon feedback based on current theme
 * - Keyboard accessible (Enter/Space to toggle)
 * - Screen reader friendly with ARIA labels
 * - Follows existing button component patterns
 * - Supports reduced motion preferences
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle className="w-full" />
 * ```
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleToggle = () => {
    // Cycle through themes: light → dark → system → light
    const nextTheme =
      theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(nextTheme)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  const getAriaLabel = () => {
    const currentThemeDisplay = theme === 'system' ? resolvedTheme : theme
    const nextTheme =
      theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    return `Switch theme from ${currentThemeDisplay} to ${nextTheme}. Current theme: ${currentThemeDisplay}`
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="size-4" />
      case 'dark':
        return <Moon className="size-4" />
      case 'system':
        return resolvedTheme === 'dark' ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )
      default:
        return <Sun className="size-4" />
    }
  }

  const getButtonText = () => {
    if (theme === 'system') {
      return resolvedTheme === 'dark' ? 'Dark (System)' : 'Light (System)'
    }
    return theme.charAt(0).toUpperCase() + theme.slice(1)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-label={getAriaLabel()}
      aria-checked={resolvedTheme === 'dark'}
      role="switch"
      className={cn('transition-all duration-200 hover:shadow-sm', className)}
      type="button"
    >
      {getIcon()}
      <span className="sr-only">Theme: {getButtonText()}</span>
      {/* Visible text for larger screens */}
      <span className="ml-2 hidden text-sm md:inline">{getButtonText()}</span>
    </Button>
  )
}
