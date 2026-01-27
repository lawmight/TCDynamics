/**
 * Tests for celebrations utility functions
 */
import {
  createMilestoneAnalyticsEvent,
  detectMilestones,
  MilestoneId,
  MILESTONES,
  UserMilestoneState,
} from '../celebrations'

describe('celebrations utility', () => {
  describe('detectMilestones', () => {
    it('should return empty array when no milestones reached', () => {
      const userState: UserMilestoneState = {
        onboardingCompleted: false,
      }
      const celebrated = new Set<MilestoneId>()

      const result = detectMilestones(userState, celebrated)

      expect(result).toEqual([])
    })

    it('should detect onboarding_complete milestone', () => {
      const userState: UserMilestoneState = {
        onboardingCompleted: true,
      }
      const celebrated = new Set<MilestoneId>()

      const result = detectMilestones(userState, celebrated)

      expect(result).toContain('onboarding_complete')
    })

    it('should detect first_workflow_activated milestone', () => {
      const userState: UserMilestoneState = {
        firstWorkflowCreatedAt: '2024-01-15T10:00:00Z',
      }
      const celebrated = new Set<MilestoneId>()

      const result = detectMilestones(userState, celebrated)

      expect(result).toContain('first_workflow_activated')
    })

    it('should detect first_document_processed milestone', () => {
      const userState: UserMilestoneState = {
        firstDocumentUploadedAt: '2024-01-15T10:00:00Z',
      }
      const celebrated = new Set<MilestoneId>()

      const result = detectMilestones(userState, celebrated)

      expect(result).toContain('first_document_processed')
    })

    it('should detect ten_workflows_created milestone', () => {
      const userState: UserMilestoneState = {
        workflowCount: 10,
      }
      const celebrated = new Set<MilestoneId>()

      const result = detectMilestones(userState, celebrated)

      expect(result).toContain('ten_workflows_created')
    })

    it('should not detect ten_workflows_created when count is less than 10', () => {
      const userState: UserMilestoneState = {
        workflowCount: 9,
      }
      const celebrated = new Set<MilestoneId>()

      const result = detectMilestones(userState, celebrated)

      expect(result).not.toContain('ten_workflows_created')
    })

    it('should not detect already celebrated milestones', () => {
      const userState: UserMilestoneState = {
        onboardingCompleted: true,
        firstWorkflowCreatedAt: '2024-01-15T10:00:00Z',
      }
      const celebrated = new Set<MilestoneId>(['onboarding_complete'])

      const result = detectMilestones(userState, celebrated)

      expect(result).not.toContain('onboarding_complete')
      expect(result).toContain('first_workflow_activated')
    })

    it('should return milestones in priority order', () => {
      const userState: UserMilestoneState = {
        onboardingCompleted: true,
        firstWorkflowCreatedAt: '2024-01-15T10:00:00Z',
        firstDocumentUploadedAt: '2024-01-16T10:00:00Z',
      }
      const celebrated = new Set<MilestoneId>()

      const result = detectMilestones(userState, celebrated)

      expect(result[0]).toBe('onboarding_complete')
      expect(result[1]).toBe('first_workflow_activated')
      expect(result[2]).toBe('first_document_processed')
    })
  })

  describe('MILESTONES config', () => {
    it('should have all required milestone configurations', () => {
      const expectedMilestones: MilestoneId[] = [
        'onboarding_complete',
        'first_workflow_activated',
        'first_document_processed',
        'ten_workflows_created',
        'first_team_member',
        'first_integration_connected',
      ]

      expectedMilestones.forEach(id => {
        expect(MILESTONES[id]).toBeDefined()
        expect(MILESTONES[id].id).toBe(id)
        expect(MILESTONES[id].title).toBeTruthy()
        expect(MILESTONES[id].message).toBeTruthy()
        expect(MILESTONES[id].ctaText).toBeTruthy()
        expect(MILESTONES[id].ctaLink).toBeTruthy()
        expect(MILESTONES[id].confetti).toBeDefined()
        expect(MILESTONES[id].analyticsEvent).toBeTruthy()
      })
    })
  })

  describe('createMilestoneAnalyticsEvent', () => {
    it('should create analytics event for shown action', () => {
      const event = createMilestoneAnalyticsEvent(
        'onboarding_complete',
        'shown'
      )

      expect(event.category).toBe('Milestone')
      expect(event.action).toBe('milestone_onboarding_complete_shown')
      expect(event.label).toBe('onboarding_complete')
    })

    it('should create analytics event for dismissed action', () => {
      const event = createMilestoneAnalyticsEvent(
        'first_workflow_activated',
        'dismissed'
      )

      expect(event.action).toBe('milestone_first_workflow_activated_dismissed')
    })

    it('should create analytics event for cta_clicked action', () => {
      const event = createMilestoneAnalyticsEvent(
        'first_document_processed',
        'cta_clicked'
      )

      expect(event.action).toBe(
        'milestone_first_document_processed_cta_clicked'
      )
    })
  })
})
