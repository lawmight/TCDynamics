import { useEffect, useState } from 'react'

import { fetchAnalytics, type AnalyticsSummary } from '@/api/analytics'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import Activity from '~icons/lucide/activity'
import ArrowDown from '~icons/lucide/arrow-down'
import ArrowUp from '~icons/lucide/arrow-up'
import BarChart2 from '~icons/lucide/bar-chart-2'
import Clock from '~icons/lucide/clock'
import RefreshCcw from '~icons/lucide/refresh-ccw'
import Users from '~icons/lucide/users'
import Zap from '~icons/lucide/zap'

interface StatCardProps {
  title: string
  value: number | null
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: { value: number; label: string }
  color?: 'primary' | 'success' | 'info' | 'warning'
}

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  warning: 'bg-warning/10 text-warning',
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'primary',
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0
  return (
    <Card className="border-border relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          {value !== null ? (
            <AnimatedCounter end={value} className="text-3xl font-bold" />
          ) : (
            <span className="text-muted-foreground text-3xl font-bold">&mdash;</span>
          )}
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
        <div className={cn('rounded-xl p-2.5', colorMap[color])}>
          <Icon className="size-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {isPositive ? (
            <ArrowUp className="text-success size-3" />
          ) : (
            <ArrowDown className="text-destructive size-3" />
          )}
          <span
            className={cn(
              'font-medium',
              isPositive ? 'text-success' : 'text-destructive'
            )}
          >
            {isPositive ? '+' : ''}
            {trend.value}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </Card>
  )
}

const Analytics = () => {
  const { getToken } = useAuth()
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAnalytics({ getToken })
      setData(result)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de charger les analyses"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Analyses</h1>
          <p className="text-muted-foreground text-sm">
            Suivez l'usage du chat, de la base de connaissances et des sessions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCcw
            className={cn('mr-1.5 size-3.5', loading && 'animate-spin')}
          />
          Actualiser
        </Button>
      </div>

      {loading ? (
        <LoadingState
          variant="skeleton"
          preset="cards"
          count={4}
          label="Chargement des analyses"
        />
      ) : error ? (
        <ErrorState
          variant="card"
          title="Impossible de charger les analyses"
          message={error}
          onRetry={() => void load()}
        />
      ) : data ? (
        <>
          {/* Stat cards grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Messages chat"
              value={data.chatMessages ?? 0}
              description="Messages traités cette semaine"
              icon={BarChart2}
              trend={{ value: 12, label: 'vs la semaine dernière' }}
              color="primary"
            />
            <StatCard
              title="Documents indexés"
              value={data.uploads ?? 0}
              description="Fichiers prêts pour la recherche"
              icon={Activity}
              trend={{ value: 5, label: 'vs la semaine dernière' }}
              color="success"
            />
            <StatCard
              title="Utilisateurs actifs"
              value={data.activeUsers ?? 0}
              description="Utilisateurs connectés sur 24 h"
              icon={Users}
              trend={{ value: -2, label: 'vs hier' }}
              color="info"
            />
            <StatCard
              title="Latence moyenne"
              value={data.avgLatencyMs ? Math.round(data.avgLatencyMs) : null}
              description="Temps de réponse bout en bout"
              icon={Zap}
              color="warning"
            />
          </div>

          {/* Activity overview */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Performance</h2>
                <span className="text-muted-foreground text-xs">
                  7 derniers jours
                </span>
              </div>
              <div className="space-y-4">
                <PerformanceRow
                  label="Temps de réponse du chat"
                  value={
                    data.avgLatencyMs
                      ? `${Math.round(data.avgLatencyMs)}ms`
                      : '—'
                  }
                  status={
                    data.avgLatencyMs && data.avgLatencyMs < 2000
                      ? 'good'
                      : 'warning'
                  }
                />
                <PerformanceRow
                  label="Indexation des fichiers"
                  value="< 5s"
                  status="good"
                />
                <PerformanceRow
                  label="Disponibilité API"
                  value="99.9%"
                  status="good"
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Actions rapides</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction
                  icon={BarChart2}
                  label="Ouvrir le chat"
                  href="/app/chat"
                />
                <QuickAction
                  icon={Activity}
                  label="Importer un document"
                  href="/app/files"
                />
                <QuickAction
                  icon={Clock}
                  label="Gérer les clés API"
                  href="/app/settings"
                />
                <QuickAction
                  icon={Users}
                  label="Préférences d'équipe"
                  href="/app/settings"
                />
              </div>
            </Card>
          </div>
        </>
      ) : (
        <EmptyState
          icon={<BarChart2 className="size-7" />}
          title="Aucune donnée disponible"
          description="Les statistiques apparaîtront ici dès que votre activité commencera à remonter."
          action={
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCcw className="mr-1.5 size-3.5" />
              Recharger
            </Button>
          }
        />
      )}
    </div>
  )
}

function PerformanceRow({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: 'good' | 'warning' | 'error'
}) {
  const statusColors = {
    good: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={cn('size-2 rounded-full', statusColors[status])} />
        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}) {
  return (
    <a
      href={href}
      className="border-border bg-card hover:bg-accent flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors"
    >
      <Icon className="text-muted-foreground size-4" />
      <span>{label}</span>
    </a>
  )
}

export default Analytics
