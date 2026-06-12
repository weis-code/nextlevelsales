'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

interface Seller {
  id: string
  email: string
  fullName: string
  role: string
  createdAt: string
}

const roleLabels: Record<string, string> = { ADMIN: 'Admin', MANAGER: 'Manager', SELLER: 'Sælger' }
const roleColors: Record<string, string> = {
  ADMIN: 'text-red-400 bg-red-400/10',
  MANAGER: 'text-yellow-400 bg-yellow-400/10',
  SELLER: 'text-blue-400 bg-blue-400/10',
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sellers')
      .then((r) => r.json())
      .then(setSellers)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sælgere</h1>
        <Link href="/admin/sellers/new" className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors">
          + Ny bruger
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase border-b border-zinc-800">
                <th className="text-left p-3 pl-4">Navn</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Rolle</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 pl-4 text-white font-medium">{seller.fullName}</td>
                  <td className="p-3 text-zinc-400">{seller.email}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${roleColors[seller.role]}`}>
                      {roleLabels[seller.role]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
