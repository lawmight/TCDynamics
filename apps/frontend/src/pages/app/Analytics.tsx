import { useEffect, useState } from 'react'

import { fetchAnalytics, type AnalyticsSummary } from '@/api/analytics'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  value: number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: { value: number; label: string }
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorMap = {
  blue: 'bg-blue-500/10 text-blue-500',
  green: 'bg-emerald-500/10 text-emerald-500',
  purple: 'bg-violet-500/10 text-violet-500',
  orange: 'bg-orange-500/10 text-orange-500',
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0
  return (
    <Card className="border-border relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <AnimatedCounter end={value} className="text-3xl font-bold" />
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
        <div className={cn('rounded-xl p-2.5', colorMap[color])}>
          <Icon className="size-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {isPositive ? (
            <ArrowUp className="size-3 text-emerald-500" />
          ) : (
            <ArrowDown className="text-destructive size-3" />
          )}
          <span
            className={cn(
              'font-medium',
              isPositive ? 'text-emerald-500' : 'text-destructive'
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
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAnalytics()
      setData(result)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load analytics'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Usage insights across chat, knowledge base, and sessions.
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
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="animate-pulse space-y-3">
                <div className="bg-muted h-3 w-20 rounded" />
                <div className="bg-muted h-8 w-16 rounded" />
                <div className="bg-muted h-3 w-32 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-destructive text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCcw className="mr-1.5 size-3.5" />
            Retry
          </Button>
        </Card>
      ) : data ? (
        <>
          {/* Stat cards grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Chat Messages"
              value={data.chatMessages ?? 0}
              description="Vertex AI [REDACTED] this week"
              icon={BarChart2}
              trend={{ value: 12, label: 'vs last week' }}
              color="blue"
            />
            <StatCard
              title="KB Documents"
              value={data.uploads ?? 0}
              description="Files indexed for retrieval"
              icon={Activity}
              trend={{ value: 5, label: 'vs last week' }}
              color="green"
            />
            <StatCard
              title="Active Users"
              value={data.activeUsers ?? 0}
              description="Signed-in users last 24h"
              icon={Users}
              trend={{ value: -2, label: 'vs yesterday' }}
              color="purple"
            />
            <StatCard
              title="Avg Latency"
              value={data.avgLatencyMs ? Math.round(data.avgLatencyMs) : 0}
              description="End-to-end response time"
              icon={Zap}
              color="orange"
            />
          </div>

          {/* Activity overview */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Performance</h3>
                <span className="text-muted-foreground text-xs">Last 7 days</span>
              </div>
              <div className="space-y-4">
                <PerformanceRow
                  label="Chat response time"
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
                  label="File indexing"
                  value="< 5s"
                  status="good"
                />
                <PerformanceRow
                  label="API uptime"
                  value="99.9%"
                  status="good"
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction
                  icon={BarChart2}
                  label="View chat logs"
                  href="/app/chat"
                />
                <QuickAction
                  icon={Activity}
                  label="Upload [REDACTED]"
                  href="/app/files"
                />
                <QuickAction
                  icon={Clock}
                  label="API key usage"
                  href="/app/settings"
                />
                <QuickAction
                  icon={Users}
                  label="Team settings"
                  href="/app/settings"
                />
              </div>
            </Card>
          </div>
        </>
      ) : null}
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
    good: 'bg-emerald-500',
    warning: 'bg-yellow-500',
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
