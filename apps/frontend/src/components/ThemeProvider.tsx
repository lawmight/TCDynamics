import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * ThemeProvider component for managing light/dark/system theme modes
 *
 * Features:
 * - Supports three modes: 'light', 'dark', 'system'
 * - Persists theme preference in localStorage
 * - Automatically detects system color scheme preference
 * - Listens for system preference changes
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
  // Initialize theme from localStorage or default to 'system'
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('theme') as Theme
      return stored || 'system'
    } catch {
      return 'system'
    }
  })

  // Track the actual resolved theme (light or dark)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Resolve theme and apply to document
  useEffect(() => {
    const root = window.document.documentElement

    // Determine the actual theme to apply
    let resolved: 'light' | 'dark' = 'light'

    if (theme === 'system') {
      // Use system preference
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } else {
      // Use explicit theme
      resolved = theme
    }

    // Update state
    setResolvedTheme(resolved)

    // Apply to DOM
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)

    // Persist to localStorage
    try {
      localStorage.setItem('theme', theme)
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }, [theme])

  // Listen for system preference changes (when theme is 'system')
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const newResolved = mediaQuery.matches ? 'dark' : 'light'
      setResolvedTheme(newResolved)

      // Update DOM
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(newResolved)
    }

    // Modern browsers support addEventListener
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook to access theme context
 *
 * @throws {Error} If used outside of ThemeProvider
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
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
