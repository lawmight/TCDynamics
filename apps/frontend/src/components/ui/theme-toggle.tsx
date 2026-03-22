import { Button } from './button'

import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'
import Moon from '~icons/lucide/moon'
import Sun from '~icons/lucide/sun'

export interface ThemeToggleProps {
  className?: string
}

/**
 * ThemeToggle component for switching between light and dark themes
 *
 * Features:
 * - Toggles light ↔ dark
 * - Visual icon feedback based on current theme
 * - Keyboard accessible (Enter/Space to toggle)
 * - Screen reader friendly with ARIA labels
 * - Follows existing button component patterns
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle className="w-full" />
 * ```
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const currentTheme = resolvedTheme ?? theme

  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  const getAriaLabel = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
    const currentThemeLabel = currentTheme === 'dark' ? 'sombre' : 'clair'
    const nextThemeLabel = nextTheme === 'dark' ? 'sombre' : 'clair'
    return `Changer le thème de ${currentThemeLabel} vers ${nextThemeLabel}. Thème actuel : ${currentThemeLabel}`
  }

  const getIcon = () => {
    return resolvedTheme === 'dark' ? (
      <Moon className="size-4" />
    ) : (
      <Sun className="size-4" />
    )
  }

  const getButtonText = () => {
    return currentTheme === 'dark' ? 'Sombre' : 'Clair'
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      aria-label={getAriaLabel()}
      aria-checked={currentTheme === 'dark'}
      role="switch"
      className={cn(
        'transition-colors duration-200 hover:shadow-sm',
        className
      )}
      type="button"
    >
      {getIcon()}
      <span className="sr-only">Thème : {getButtonText()}</span>
      {/* Visible text for larger screens */}
      <span className="ml-2 hidden text-sm md:inline">{getButtonText()}</span>
    </Button>
  )
}
