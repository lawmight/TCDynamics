import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { fetchMetricsOverview } from '@/api/metrics'
import { CelebrationModal } from '@/components/app/CelebrationModal'
import { useMilestoneDetection } from '@/hooks/useMilestoneDetection'
import type { UserMilestoneState } from '@/utils/celebrations'
import { getWithMigration, LS } from '@/utils/storageMigration'

const getStoredProjectId = (): string => {
  try {
    return getWithMigration(LS.RUM_PROJECT_ID, 'rum.projectId') || ''
  } catch {
    return ''
  }
}

const Dashboard = () => {
  const [projectId] = useState<string>(getStoredProjectId())
  const days = 7

  const { data, isLoading, isError } = useQuery({
    queryKey: ['metrics', 'overview', projectId, days],
    queryFn: () => fetchMetricsOverview(projectId, days),
    enabled: !!projectId,
  })

  // Milestone detection - in production, this would come from user API/context
  // For now, using placeholder state that can be connected to real user data
  const userMilestoneState: UserMilestoneState = {
    onboardingCompleted: false, // TODO: Connect to real user state
    firstWorkflowCreatedAt: undefined,
    firstDocumentUploadedAt: undefined,
    workflowCount: 0,
    teamMemberCount: 0,
    integrationCount: 0,
  }

  const { activeMilestone, dismissMilestone, handleCtaClick } =
    useMilestoneDetection({
      userState: userMilestoneState,
      disabled: isLoading,
    })

  // React Compiler handles optimization automatically
  const r = data?.results || {}
  const asNum = (v: unknown) =>
    typeof v === 'string' ? Number(v) : (v as number)
  const cards = [
    {
      key: 'LCP',
      label: 'p75 LCP (ms)',
      value: r.LCP ? Math.round(asNum(r.LCP.p75)) : '-',
    },
    {
      key: 'INP',
      label: 'p75 INP (ms)',
      value: r.INP ? Math.round(asNum(r.INP.p75)) : '-',
    },
    {
      key: 'CLS',
      label: 'p75 CLS',
      value: r.CLS ? asNum(r.CLS.p75).toFixed(3) : '-',
    },
    {
      key: 'FCP',
      label: 'p75 FCP (ms)',
      value: r.FCP ? Math.round(asNum(r.FCP.p75)) : '-',
    },
  ]

  if (!projectId) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="mb-2 text-2xl font-semibold">
          Web Performance Dashboard
        </h1>
        <p className="text-muted-foreground">
          No project configured. Go to Settings to set your Project ID.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="border-primary size-12 animate-spin rounded-full border-b-2"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="mb-2 text-2xl font-semibold">
          Web Performance Dashboard
        </h1>
        <p className="text-destructive">Failed to load metrics.</p>
      </div>
    )
  }

  return (
    <>
      {/* Milestone Celebration Modal */}
      {activeMilestone && (
        <CelebrationModal
          milestone={activeMilestone}
          onDismiss={dismissMilestone}
          onCtaClick={handleCtaClick}
        />
      )}

      <div className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">
          Web Performance Dashboard
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {cards.map(card => (
            <div
              key={card.key}
              role="group"
              aria-label={`${card.label}: ${card.value}`}
              className="rounded-lg border p-4"
            >
              <div className="text-muted-foreground text-sm">{card.label}</div>
              <div className="mt-1 text-2xl font-bold">
                {card.value !== '-' ? (
                  <data value={card.value}>{String(card.value)}</data>
                ) : (
                  String(card.value)
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-4 text-sm">
          Window: last {days} days • Project: {projectId}
        </p>
      </div>
    </>
  )
}

export default Dashboard
