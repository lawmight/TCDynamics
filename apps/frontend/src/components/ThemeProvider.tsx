import { createContext, useContext, useEffect, useState } from 'react'

import { getWithMigration, LS, setCached } from '@/utils/storageMigration'

type Theme = 'light' | 'dark'

function normalizeThemeFromStorage(stored: string | null | undefined): Theme {
  if (stored === 'light' || stored === 'dark') return stored
  if (stored === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return 'dark'
  }
  return 'dark'
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * ThemeProvider component for managing light/dark theme modes
 *
 * Features:
 * - Supports explicit 'light' and 'dark' only (no system-follow mode)
 * - Persists theme preference in localStorage
 * - Migrates legacy stored value 'system' once to light or dark from OS preference
 * - Applies theme class to document root element
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // In components:
 * const { theme, setTheme, resolvedTheme } = useTheme()
 * ```
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = getWithMigration(LS.THEME, 'theme') as string | null
      return normalizeThemeFromStorage(stored)
    } catch {
      return 'dark'
    }
  })

  // Track the actual resolved theme (light or dark)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')

  // Apply theme to document and persist
  useEffect(() => {
    const root = window.document.documentElement

    setResolvedTheme(theme)
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    try {
      setCached(LS.THEME, theme)
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }, [theme])

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  setTheme: () => {},
  resolvedTheme: 'dark',
}

/**
 * Hook to access theme context
 *
 * Returns a default theme when used outside ThemeProvider (e.g. duplicate React
 * instances) so the app does not crash; behavior is unchanged when context exists.
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, setTheme, resolvedTheme } = useTheme()
 *
 *   return (
 *     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
 *       Current: {resolvedTheme}
 *     </button>
 *   )
 * }
 * ```
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)

  if (!context) {
    if (import.meta.env.DEV) {
      console.warn(
        'useTheme: no ThemeProvider context (e.g. duplicate React). Using default theme.'
      )
    }
    return defaultThemeContext
  }

  return context
}
