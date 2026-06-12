'use client'

import { useEffect, useState } from 'react'
import { Toast } from '@/components/Toast'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

interface Period { id: string; name: string }
interface Seller { id: string; fullName: string }
interface Task { id: string; name: string }

interface Target {
  id: string
  payPeriod: { name: string }
  seller: { fullName: string }
  task: { name: string }
  unitTarget: number | null
  revenueTarget: string | null
}

export default function TargetsPage() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [targets, setTargets] = useState<Target[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({ payPeriodId: '', sellerId: '', taskId: '', unitTarget: '', revenueTarget: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/periods').then((r) => r.json()),
      fetch('/api/sellers').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/targets').then((r) => r.json()),
    ]).then(([p, s, t, tg]) => {
      setPeriods(p)
      setSellers(s)
      setTasks(t)
      setTargets(tg)
    }).finally(() => setLoading(false))
  }, [])

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast({ message: 'Mål oprettet!', type: 'success' })
      setForm((f) => ({ ...f, unitTarget: '', revenueTarget: '' }))
      fetch('/api/targets').then((r) => r.json()).then(setTargets)
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Noget gik galt', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-white">Sæt mål</h1>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Nyt mål</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Lønperiode</label>
            <select value={form.payPeriodId} onChange={(e) => set('payPeriodId', e.target.value)} required className={inputCls}>
              <option value="">Vælg periode</option>
              {periods.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Sælger</label>
            <select value={form.sellerId} onChange={(e) => set('sellerId', e.target.value)} required className={inputCls}>
              <option value="">Vælg sælger</option>
              {sellers.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Opgave</label>
            <select value={form.taskId} onChange={(e) => set('taskId', e.target.value)} required className={inputCls}>
              <option value="">Vælg opgave</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Enhedsmål (antal)</label>
            <input type="number" min="1" value={form.unitTarget} onChange={(e) => set('unitTarget', e.target.value)} placeholder="f.eks. 20" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Omsætningsmål (DKK)</label>
            <input type="number" min="0" value={form.revenueTarget} onChange={(e) => set('revenueTarget', e.target.value)} placeholder="f.eks. 50000" className={inputCls} />
          </div>
        </div>
        <button type="submit" disabled={submitting} className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
          {submitting ? 'Gemmer...' : 'Gem mål'}
        </button>
      </form>

      {/* Existing targets */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">Eksisterende mål</h2>
        </div>
        {loading ? (
          <div className="p-4"><LoadingSkeleton rows={4} /></div>
        ) : targets.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">Ingen mål oprettet endnu</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase border-b border-zinc-800">
                <th className="text-left p-3 pl-4">Periode</th>
                <th className="text-left p-3">Sælger</th>
                <th className="text-left p-3">Opgave</th>
                <th className="text-left p-3">Enhedsmål</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => (
                <tr key={t.id} className="border-b border-zinc-800/50">
                  <td className="p-3 pl-4 text-zinc-400">{t.payPeriod.name}</td>
                  <td className="p-3 text-white">{t.seller.fullName}</td>
                  <td className="p-3 text-zinc-300 max-w-40 truncate">{t.task.name}</td>
                  <td className="p-3 text-blue-400 font-medium">{t.unitTarget ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
