'use client'

import { useEffect, useState } from 'react'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { cn } from '@/lib/utils'

interface LeaderboardRow {
  rank: number
  sellerId: string
  sellerName: string
  tasks: { taskId: string; taskName: string; units: number }[]
  totalUnits: number
  calls: number
  meetings: number
  activityScore: number
}

const filters = [
  { value: 'week', label: 'Denne uge' },
  { value: 'month', label: 'Denne måned' },
  { value: 'period', label: 'Aktiv periode' },
]

const rankStyles = ['text-yellow-400', 'text-zinc-300', 'text-amber-600']
const rankEmojis = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [filter, setFilter] = useState('period')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?filter=${filter}`)
      .then((r) => r.json())
      .then(setRows)
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">Leaderboard</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              filter === f.value ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
          Ingen data i denne periode
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const isTop3 = row.rank <= 3
            return (
              <div
                key={row.sellerId}
                className={cn(
                  'bg-zinc-900 border rounded-2xl p-4 flex items-center gap-4 transition-colors',
                  isTop3 ? 'border-zinc-700' : 'border-zinc-800'
                )}
              >
                <div className="w-8 text-center shrink-0">
                  {isTop3 ? (
                    <span className="text-2xl">{rankEmojis[row.rank - 1]}</span>
                  ) : (
                    <span className="text-zinc-500 font-bold text-lg">{row.rank}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn('font-semibold', isTop3 ? rankStyles[row.rank - 1] : 'text-white')}>
                    {row.sellerName}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {row.tasks.map((t) => (
                      <span key={t.taskId} className="text-xs text-zinc-500">
                        {t.taskName.split('—')[1]?.trim() ?? t.taskName}: {t.units}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-white font-bold">{row.totalUnits}</p>
                  <p className="text-zinc-500 text-xs">enheder</p>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-blue-400 font-bold">{row.activityScore}</p>
                  <p className="text-zinc-500 text-xs">score</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
