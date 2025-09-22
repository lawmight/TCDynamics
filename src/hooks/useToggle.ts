import { useState, useCallback } from 'react'

interface UseToggleReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setOpen: (value: boolean) => void
}

/**
 * Custom hook for managing toggle state with consistent API
 * Provides open, close, toggle, and setOpen methods for flexible state management
 *
 * @param initialState - Initial state of the toggle (default: false)
 * @returns Object with toggle state and control methods
 */
export function useToggle(initialState: boolean = false): UseToggleReturn {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  const setOpen = useCallback((value: boolean) => setIsOpen(value), [])

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen,
  }
}
