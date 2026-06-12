'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { KPICard } from '@/components/KPICard'
import { ProgressBar } from '@/components/ProgressBar'
import { ActivityChart } from '@/components/ActivityChart'
import { CardSkeleton, LoadingSkeleton } from '@/components/LoadingSkeleton'
import { formatDate, daysRemaining } from '@/lib/utils'

interface DashboardData {
  kpis: {
    calls: number
    pickupRate: number
    bookingRate: number
    showRate: number
    closingRate: number
  }
  activityChart: { date: string; calls: number }[]
  periodProgress: {
    period: { id: string; name: string; startDate: string; endDate: string }
    targets: { taskId: string; taskName: string; unitTarget: number | null; unitsSold: number }[]
  }[]
  recentSales: {
    id: string
    saleDate: string
    taskName: string
    compensationType: string
    units: number
    packageName: string | null
    status: string
    sellerNote: string | null
  }[]
}

const statusColors: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10',
  CONFIRMED: 'text-blue-400 bg-blue-400/10',
  PAID: 'text-green-400 bg-green-400/10',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Afventer',
  CONFIRMED: 'Bekræftet',
  PAID: 'Betalt',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto md:max-w-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/log"
          className="bg-blue-500 hover:bg-blue-600 rounded-2xl p-5 flex flex-col items-center gap-2 transition-colors"
        >
          <span className="text-3xl">📋</span>
          <span className="font-semibold text-white text-sm">Log dagens aktivitet</span>
        </Link>
        <Link
          href="/dashboard/sales/new"
          className="bg-green-500 hover:bg-green-600 rounded-2xl p-5 flex flex-col items-center gap-2 transition-colors"
        >
          <span className="text-3xl">💰</span>
          <span className="font-semibold text-white text-sm">Registrer salg</span>
        </Link>
      </div>

      {/* Period progress */}
      {loading ? (
        <CardSkeleton />
      ) : data?.periodProgress?.length ? (
        data.periodProgress.map((pp) => (
          <div key={pp.period.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">{pp.period.name}</h2>
              <span className="text-xs text-zinc-500">{daysRemaining(pp.period.endDate)} dage tilbage</span>
            </div>
            {pp.targets.length === 0 && (
              <p className="text-zinc-500 text-sm">Ingen mål sat for denne periode</p>
            )}
            {pp.targets.map((t) =>
              t.unitTarget ? (
                <ProgressBar
                  key={t.taskId}
                  value={t.unitsSold}
                  max={t.unitTarget}
                  label={t.taskName}
                />
              ) : null
            )}
          </div>
        ))
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-500 text-sm">
          Ingen aktiv lønperiode
        </div>
      )}

      {/* KPI cards */}
      <div>
        <h2 className="font-semibold text-white mb-3">Denne uge</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <KPICard label="Opkald" value={data?.kpis.calls ?? 0} color="blue" icon="📞" />
            <KPICard label="Pick-up rate" value={`${data?.kpis.pickupRate ?? 0}%`} color="green" icon="✅" />
            <KPICard label="Booking rate" value={`${data?.kpis.bookingRate ?? 0}%`} color="yellow" icon="📅" />
            <KPICard label="Show rate" value={`${data?.kpis.showRate ?? 0}%`} color="blue" icon="🤝" />
            <div className="col-span-2">
              <KPICard label="Closing rate" value={`${data?.kpis.closingRate ?? 0}%`} color="green" icon="🏆" />
            </div>
          </div>
        )}
      </div>

      {/* Activity chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="font-semibold text-white mb-4">Opkald — seneste 14 dage</h2>
        {loading ? (
          <div className="h-48 bg-zinc-800 rounded-xl animate-pulse" />
        ) : (
          <ActivityChart data={data?.activityChart ?? []} />
        )}
      </div>

      {/* Recent sales */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Mine seneste salg</h2>
          <Link href="/dashboard/sales" className="text-blue-400 text-sm">Se alle</Link>
        </div>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : data?.recentSales?.length === 0 ? (
          <p className="text-zinc-500 text-sm">Ingen salg registreret endnu</p>
        ) : (
          <div className="space-y-2">
            {data?.recentSales?.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{sale.taskName}</p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(sale.saleDate)}
                    {sale.packageName && ` · ${sale.packageName}`}
                    {sale.compensationType === 'FIXED' && ` · ${sale.units} enhed${sale.units !== 1 ? 'er' : ''}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusColors[sale.status]}`}>
                  {statusLabels[sale.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
