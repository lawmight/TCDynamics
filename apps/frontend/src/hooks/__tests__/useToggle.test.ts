import { renderHook, act } from '@testing-library/react'

import { useToggle } from '../useToggle'

describe('useToggle Hook', () => {
  it('should initialize with default false state', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current.isOpen).toBe(false)
  })

  it('should initialize with provided initial state', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current.isOpen).toBe(true)
  })

  it('should toggle state correctly', () => {
    const { result } = renderHook(() => useToggle())

    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.toggle()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should open state correctly', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.open()
    })
    expect(result.current.isOpen).toBe(true)
  })

  it('should close state correctly', () => {
    const { result } = renderHook(() => useToggle(true))

    act(() => {
      result.current.close()
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should set state directly', () => {
    const { result } = renderHook(() => useToggle())

    act(() => {
      result.current.setOpen(true)
    })
    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.setOpen(false)
    })
    expect(result.current.isOpen).toBe(false)
  })

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useToggle())

    const initialToggle = result.current.toggle
    const initialOpen = result.current.open
    const initialClose = result.current.close
    const initialSetOpen = result.current.setOpen

    rerender()

    expect(result.current.toggle).toBe(initialToggle)
    expect(result.current.open).toBe(initialOpen)
    expect(result.current.close).toBe(initialClose)
    expect(result.current.setOpen).toBe(initialSetOpen)
  })
})
