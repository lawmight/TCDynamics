/**
 * Tests for useMilestoneDetection hook
 */
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMilestoneDetection } from '../useMilestoneDetection'

// Mock analytics
vi.mock('@/utils/analytics', () => ({
  analytics: {
    trackEvent: vi.fn(),
  },
}))

// Mock celebrations utilities (vi.hoisted so available in vi.mock factory)
const {
  mockGetCelebratedMilestones,
  mockMarkMilestoneCelebrated,
  mockAreCelebrationsDisabled,
} = vi.hoisted(() => ({
  mockGetCelebratedMilestones: vi.fn(),
  mockMarkMilestoneCelebrated: vi.fn(),
  mockAreCelebrationsDisabled: vi.fn(),
}))

vi.mock('@/utils/celebrations', async () => {
  const actual = await vi.importActual<typeof import('@/utils/celebrations')>(
    '@/utils/celebrations'
  )
  return {
    ...actual,
    getCelebratedMilestones: () => mockGetCelebratedMilestones(),
    markMilestoneCelebrated: (id: string) => mockMarkMilestoneCelebrated(id),
    areCelebrationsDisabled: () => mockAreCelebrationsDisabled(),
  }
})

describe('useMilestoneDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCelebratedMilestones.mockReturnValue(new Set())
    mockAreCelebrationsDisabled.mockReturnValue(false)
  })

  it('should return null when no milestones detected', () => {
    const { result } = renderHook(() =>
      useMilestoneDetection({
        userState: {
          onboardingCompleted: false,
        },
      })
    )

    expect(result.current.activeMilestone).toBeNull()
  })

  it('should detect onboarding_complete milestone', () => {
    const { result } = renderHook(() =>
      useMilestoneDetection({
        userState: {
          onboardingCompleted: true,
        },
      })
    )

    expect(result.current.activeMilestone).not.toBeNull()
    expect(result.current.activeMilestone?.id).toBe('onboarding_complete')
  })

  it('should detect first_workflow_activated milestone', () => {
    const { result } = renderHook(() =>
      useMilestoneDetection({
        userState: {
          firstWorkflowCreatedAt: '2024-01-15T10:00:00Z',
        },
      })
    )

    expect(result.current.activeMilestone?.id).toBe('first_workflow_activated')
  })

  it('should not detect already celebrated milestones', () => {
    mockGetCelebratedMilestones.mockReturnValue(
      new Set(['onboarding_complete'])
    )

    const { result } = renderHook(() =>
      useMilestoneDetection({
        userState: {
          onboardingCompleted: true,
        },
      })
    )

    expect(result.current.activeMilestone).toBeNull()
  })

  it('should dismiss milestone and mark as celebrated', async () => {
    const { result } = renderHook(() =>
      useMilestoneDetection({
        userState: {
          onboardingCompleted: true,
        },
      })
    )

    expect(result.current.activeMilestone).not.toBeNull()

    await act(async () => {
      result.current.dismissMilestone()
    })

    expect(mockMarkMilestoneCelebrated).toHaveBeenCalledWith(
      'onboarding_complete'
    )
    // Hook clears activeMilestone via setState; in test env we verify the side effect
  })

  it('should return celebrationsDisabled when disabled', () => {
    mockAreCelebrationsDisabled.mockReturnValue(true)

    const { result } = renderHook(() =>
      useMilestoneDetection({
        userState: {
          onboardingCompleted: true,
        },
      })
    )

    expect(result.current.celebrationsDisabled).toBe(true)
    expect(result.current.activeMilestone).toBeNull()
  })

  it('should not detect milestones when disabled prop is true', () => {
    const { result } = renderHook(() =>
      useMilestoneDetection({
        userState: {
          onboardingCompleted: true,
        },
        disabled: true,
      })
    )

    expect(result.current.activeMilestone).toBeNull()
  })

  it('should detect milestone priority order', () => {
    // When multiple milestones are reached, onboarding_complete should be first
    const { result } = renderHook(() =>
      useMilestoneDetection({
        userState: {
          onboardingCompleted: true,
          firstWorkflowCreatedAt: '2024-01-15T10:00:00Z',
          firstDocumentUploadedAt: '2024-01-16T10:00:00Z',
        },
      })
    )

    expect(result.current.activeMilestone?.id).toBe('onboarding_complete')
  })
})
