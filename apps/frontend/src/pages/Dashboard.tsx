import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchMetricsOverview } from '@/api/metrics'
import { CelebrationModal } from '@/components/app/CelebrationModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'
import { useMilestoneDetection } from '@/hooks/useMilestoneDetection'
import type { UserMilestoneState } from '@/utils/celebrations'
import { getWithMigration, LS } from '@/utils/storageMigration'
import BarChart3 from '~icons/lucide/bar-chart-3'
import Settings from '~icons/lucide/settings'

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

  const { data, isLoading, isError, refetch } = useQuery({
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
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord performance</h1>
          <p className="text-muted-foreground text-sm">
            Suivez les principaux indicateurs de performance web de votre projet.
          </p>
        </div>
        <EmptyState
          icon={<Settings className="size-7" />}
          title="Aucun projet configuré"
          description="Ajoutez votre identifiant de projet dans les paramètres pour afficher vos indicateurs de performance."
          action={
            <Button asChild>
              <Link to="/app/settings">Ouvrir les paramètres</Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord performance</h1>
          <p className="text-muted-foreground text-sm">
            Chargement de vos indicateurs web.
          </p>
        </div>
        <LoadingState
          variant="skeleton"
          preset="cards"
          count={4}
          label="Chargement du tableau de bord"
        />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Tableau de bord performance</h1>
          <p className="text-muted-foreground text-sm">
            Un problème est survenu lors du chargement de vos indicateurs.
          </p>
        </div>
        <ErrorState
          variant="card"
          title="Impossible de charger les mesures"
          message="Vérifiez votre configuration puis relancez le chargement."
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      {/* Milestone Celebration Modal */}
      {activeMilestone && (
        <CelebrationModal
          milestone={activeMilestone}
          onDismiss={dismissMilestone}
          onCtaClick={handleCtaClick}
        />
      )}

      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord performance</h1>
        <p className="text-muted-foreground text-sm">
          Vue synthèse des Core Web Vitals de votre projet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {cards.map(card => (
          <Card
            key={card.key}
            role="group"
            aria-label={`${card.label}: ${card.value}`}
          >
            <CardContent className="p-5">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                <BarChart3 className="size-4" />
                <span>{card.label}</span>
              </div>
              <div className="text-2xl font-bold">
                {card.value !== '-' ? (
                  <data value={card.value}>{String(card.value)}</data>
                ) : (
                  String(card.value)
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Fenêtre : {days} derniers jours • Projet : {projectId}
      </p>
    </main>
  )
}

export default Dashboard
