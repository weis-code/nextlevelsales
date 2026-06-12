'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/KPICard'
import { CardSkeleton } from '@/components/LoadingSkeleton'
import { formatDKK } from '@/lib/utils'

interface Revenue {
  thisMonth: number
  prevMonth: number
  byTask: { taskName: string; revenue: number }[]
  bySeller: { sellerName: string; revenue: number }[]
  byType: { type: string; revenue: number }[]
}

const typeLabels: Record<string, string> = { FIXED: 'Fast pris', PERCENTAGE: 'Provision', PACKAGE: 'Pakker' }

export default function RevenuePage() {
  const [data, setData] = useState<Revenue | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/revenue').then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  const mom = data ? ((data.thisMonth - data.prevMonth) / Math.max(1, data.prevMonth)) * 100 : 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Omsætning</h1>

      {/* Top KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            label="Denne måned"
            value={formatDKK(data?.thisMonth ?? 0)}
            sub={`${mom >= 0 ? '+' : ''}${mom.toFixed(1)}% vs. forrige`}
            trend={mom > 0 ? 'up' : mom < 0 ? 'down' : 'neutral'}
            color="green"
            icon="💹"
          />
          <KPICard label="Forrige måned" value={formatDKK(data?.prevMonth ?? 0)} color="blue" icon="📅" />
        </div>
      )}

      {/* By task */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="font-semibold text-white mb-4">Omsætning per opgave</h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-zinc-800 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-3">
            {data?.byTask.sort((a, b) => b.revenue - a.revenue).map((t) => {
              const pct = data.thisMonth > 0 ? (t.revenue / data.thisMonth) * 100 : 0
              return (
                <div key={t.taskName}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300 truncate max-w-60">{t.taskName}</span>
                    <span className="text-green-400 font-medium shrink-0 ml-2">{formatDKK(t.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {data?.byTask.length === 0 && <p className="text-zinc-500 text-sm">Ingen data</p>}
          </div>
        )}
      </div>

      {/* By seller */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="font-semibold text-white mb-4">Omsætning per sælger</h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-zinc-800 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-3">
            {data?.bySeller.sort((a, b) => b.revenue - a.revenue).map((s) => {
              const pct = data.thisMonth > 0 ? (s.revenue / data.thisMonth) * 100 : 0
              return (
                <div key={s.sellerName}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300">{s.sellerName}</span>
                    <span className="text-blue-400 font-medium">{formatDKK(s.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {data?.bySeller.length === 0 && <p className="text-zinc-500 text-sm">Ingen data</p>}
          </div>
        )}
      </div>

      {/* By type */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="font-semibold text-white mb-4">Breakdown per kompensationstype</h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-zinc-800 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-2">
            {data?.byType.map((t) => (
              <div key={t.type} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-zinc-300 text-sm">{typeLabels[t.type] ?? t.type}</span>
                <span className="text-yellow-400 font-medium text-sm">{formatDKK(t.revenue)}</span>
              </div>
            ))}
            {data?.byType.length === 0 && <p className="text-zinc-500 text-sm">Ingen data</p>}
          </div>
        )}
      </div>
    </div>
  )
}
