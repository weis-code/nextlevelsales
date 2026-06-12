'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { formatDate } from '@/lib/utils'

interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
}

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/periods').then((r) => r.json()).then(setPeriods).finally(() => setLoading(false))
  }, [])

  const now = new Date()

  function isActive(p: Period) {
    return new Date(p.startDate) <= now && new Date(p.endDate) >= now
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Lønperioder</h1>
        <Link href="/admin/periods/new" className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
          + Ny periode
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <div className="space-y-3">
          {periods.map((p) => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{p.name}</p>
                  {isActive(p) && (
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-lg font-medium">Aktiv</span>
                  )}
                </div>
                <p className="text-zinc-500 text-sm mt-0.5">
                  {formatDate(p.startDate)} – {formatDate(p.endDate)}
                </p>
              </div>
            </div>
          ))}
          {periods.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
              Ingen perioder oprettet endnu
            </div>
          )}
        </div>
      )}
    </div>
  )
}
