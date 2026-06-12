'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { KPICard } from '@/components/KPICard'
import { CardSkeleton, LoadingSkeleton } from '@/components/LoadingSkeleton'
import { formatDKK, formatDate } from '@/lib/utils'
import { Toast } from '@/components/Toast'

interface Sale {
  id: string
  saleDate: string
  taskName: string
  clientName: string
  sellerName: string
  compensationType: string
  units: number
  packageName: string | null
  houseRevenue: number
  status: string
}

interface Revenue {
  thisMonth: number
  prevMonth: number
  byTask: { taskName: string; revenue: number }[]
  bySeller: { sellerName: string; revenue: number }[]
  byType: { type: string; revenue: number }[]
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

export default function AdminPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [revenue, setRevenue] = useState<Revenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/sales').then((r) => r.json()),
      fetch('/api/revenue').then((r) => r.json()),
    ]).then(([s, r]) => {
      setSales(s)
      setRevenue(r)
    }).finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/sales/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setSales((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
      setToast({ message: 'Status opdateret', type: 'success' })
    } else {
      setToast({ message: 'Fejl ved opdatering', type: 'error' })
    }
  }

  const mom = revenue ? ((revenue.thisMonth - revenue.prevMonth) / Math.max(1, revenue.prevMonth)) * 100 : 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin overblik</h1>
        <div className="flex gap-2">
          <Link href="/admin/tasks/new" className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
            + Opgave
          </Link>
          <Link href="/admin/sellers/new" className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
            + Sælger
          </Link>
        </div>
      </div>

      {/* Revenue summary */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPICard
            label="Omsætning denne måned"
            value={formatDKK(revenue?.thisMonth ?? 0)}
            sub={`${mom >= 0 ? '+' : ''}${mom.toFixed(1)}% vs. forrige måned`}
            trend={mom > 0 ? 'up' : mom < 0 ? 'down' : 'neutral'}
            color="green"
            icon="💹"
          />
          <KPICard
            label="Forrige måned"
            value={formatDKK(revenue?.prevMonth ?? 0)}
            color="blue"
            icon="📅"
          />
          <div className="col-span-2 md:col-span-1">
            <KPICard
              label="Salg i alt"
              value={sales.length}
              sub={`${sales.filter((s) => s.status === 'PENDING').length} afventer`}
              color="yellow"
              icon="📊"
            />
          </div>
        </div>
      )}

      {/* Quick admin links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { href: '/admin/tasks', label: 'Opgaver', icon: '📁' },
          { href: '/admin/sellers', label: 'Sælgere', icon: '👥' },
          { href: '/admin/periods', label: 'Perioder', icon: '📅' },
          { href: '/admin/targets', label: 'Mål', icon: '🎯' },
          { href: '/admin/revenue', label: 'Omsætning', icon: '💹' },
          { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: '🏆' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center gap-3 transition-colors"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-white font-medium text-sm">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Sales status tracker */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">Salgsstatus</h2>
        </div>
        {loading ? (
          <div className="p-4"><LoadingSkeleton rows={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase border-b border-zinc-800">
                  <th className="text-left p-3 pl-4">Dato</th>
                  <th className="text-left p-3">Sælger</th>
                  <th className="text-left p-3">Opgave</th>
                  <th className="text-left p-3">Omsætning</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Skift</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 30).map((sale) => (
                  <tr key={sale.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 pl-4 text-zinc-400">{formatDate(sale.saleDate)}</td>
                    <td className="p-3 text-white">{sale.sellerName}</td>
                    <td className="p-3 text-zinc-300 max-w-48">
                      <span className="truncate block">{sale.taskName}</span>
                      {sale.packageName && <span className="text-xs text-zinc-500">{sale.packageName}</span>}
                    </td>
                    <td className="p-3 text-green-400 font-medium">{formatDKK(sale.houseRevenue)}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusColors[sale.status]}`}>
                        {statusLabels[sale.status]}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={sale.status}
                        onChange={(e) => updateStatus(sale.id, e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="PENDING">Afventer</option>
                        <option value="CONFIRMED">Bekræftet</option>
                        <option value="PAID">Betalt</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
