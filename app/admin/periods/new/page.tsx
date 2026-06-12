'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Toast } from '@/components/Toast'

export default function NewPeriodPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast({ message: 'Lønperiode oprettet!', type: 'success' })
      setTimeout(() => router.push('/admin/periods'), 1500)
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Noget gik galt', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

  return (
    <div className="p-4 md:p-6 max-w-lg">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-white mb-6">Opret lønperiode</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Periodenavn</label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="f.eks. Juni 2026" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 font-medium">Startdato</label>
              <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 font-medium">Slutdato</label>
              <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} required className={inputCls} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Opretter...' : 'Opret lønperiode'}
        </button>
      </form>
    </div>
  )
}
