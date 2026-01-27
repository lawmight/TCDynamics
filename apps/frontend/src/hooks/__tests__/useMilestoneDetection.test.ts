/**
 * Tests for useMilestoneDetection hook
 */
import { act, renderHook } from '@testing-library/react'

import { useMilestoneDetection } from '../useMilestoneDetection'

// Mock analytics
jest.mock('@/utils/analytics', () => ({
  analytics: {
    trackEvent: jest.fn(),
  },
}))

// Mock celebrations utilities
const mockGetCelebratedMilestones = jest.fn()
const mockMarkMilestoneCelebrated = jest.fn()
const mockAreCelebrationsDisabled = jest.fn()

jest.mock('@/utils/celebrations', () => ({
  ...jest.requireActual('@/utils/celebrations'),
  getCelebratedMilestones: () => mockGetCelebratedMilestones(),
  markMilestoneCelebrated: (id: string) => mockMarkMilestoneCelebrated(id),
  areCelebrationsDisabled: () => mockAreCelebrationsDisabled(),
}))

describe('useMilestoneDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  it('should dismiss milestone and mark as celebrated', () => {
    const { result } = renderHook(() =>
      useMilestoneDetection({
        userState: {
          onboardingCompleted: true,
        },
      })
    )

    expect(result.current.activeMilestone).not.toBeNull()

    act(() => {
      result.current.dismissMilestone()
    })

    expect(mockMarkMilestoneCelebrated).toHaveBeenCalledWith(
      'onboarding_complete'
    )
    expect(result.current.activeMilestone).toBeNull()
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
