'use client'

import { useEffect, useState } from 'react'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { formatDate } from '@/lib/utils'

interface Sale {
  id: string
  saleDate: string
  taskName: string
  compensationType: string
  units: number
  packageName: string | null
  status: string
  sellerNote: string | null
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

const typeLabels: Record<string, string> = {
  FIXED: 'Fast pris',
  PERCENTAGE: 'Provision',
  PACKAGE: 'Pakke',
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sales')
      .then((r) => r.json())
      .then(setSales)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Mine salg</h1>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : sales.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
          Ingen salg registreret endnu
        </div>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium">{sale.taskName}</p>
                  <p className="text-zinc-500 text-sm mt-0.5">
                    {formatDate(sale.saleDate)} · {typeLabels[sale.compensationType]}
                    {sale.packageName && ` · ${sale.packageName}`}
                    {sale.compensationType === 'FIXED' && ` · ${sale.units} enhed${sale.units !== 1 ? 'er' : ''}`}
                  </p>
                  {sale.sellerNote && (
                    <p className="text-zinc-400 text-xs mt-1 italic">"{sale.sellerNote}"</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium shrink-0 ml-3 ${statusColors[sale.status]}`}>
                  {statusLabels[sale.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
