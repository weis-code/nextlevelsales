'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { formatDKK } from '@/lib/utils'

interface Task {
  id: string
  name: string
  clientName: string
  status: string
  compensationModel: { type: string; pricePerUnit?: number; percentage?: number; packages?: { name: string; price: number }[] }
  assignments: { seller: { id: string; fullName: string } }[]
  _count: { sales: number; activityLogs: number }
}

const statusLabels: Record<string, string> = { ACTIVE: 'Aktiv', PAUSED: 'Pause', COMPLETED: 'Afsluttet' }
const statusColors: Record<string, string> = {
  ACTIVE: 'text-green-400 bg-green-400/10',
  PAUSED: 'text-yellow-400 bg-yellow-400/10',
  COMPLETED: 'text-zinc-400 bg-zinc-400/10',
}

function modelSummary(m: Task['compensationModel']) {
  if (m.type === 'fixed') return `Fast pris · ${formatDKK(m.pricePerUnit ?? 0)}/enhed`
  if (m.type === 'percentage') return `Provision · ${m.percentage}%`
  if (m.type === 'package') return `Pakker: ${m.packages?.map((p) => p.name).join(', ')}`
  return '—'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then(setTasks)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Opgaver</h1>
        <Link href="/admin/tasks/new" className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
          + Ny opgave
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : tasks.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
          Ingen opgaver oprettet endnu
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-medium">{task.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm mt-0.5">{task.clientName}</p>
                  <p className="text-zinc-400 text-xs mt-1">{modelSummary(task.compensationModel)}</p>
                  <div className="flex gap-3 mt-2 text-xs text-zinc-500">
                    <span>{task.assignments.length} sælgere</span>
                    <span>{task._count.sales} salg</span>
                    <span>{task._count.activityLogs} aktivitetslogs</span>
                  </div>
                  {task.assignments.length > 0 && (
                    <p className="text-xs text-zinc-600 mt-1">
                      {task.assignments.map((a) => a.seller.fullName).join(', ')}
                    </p>
                  )}
                </div>
                <Link
                  href={`/admin/tasks/${task.id}`}
                  className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Rediger
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
