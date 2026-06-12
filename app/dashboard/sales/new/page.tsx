'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Toast } from '@/components/Toast'
import { formatDKK } from '@/lib/utils'

interface Package {
  name: string
  price: number
}

interface Task {
  id: string
  name: string
  compensationModel: {
    type: 'fixed' | 'percentage' | 'package'
    label: string
    pricePerUnit?: number
    percentage?: number
    packages?: Package[]
  }
}

export default function NewSalePage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({
    taskId: '',
    saleDate: new Date().toISOString().split('T')[0],
    units: '1',
    dealSize: '',
    packageName: '',
    sellerNote: '',
  })

  useEffect(() => {
    fetch('/api/tasks?mine=true')
      .then((r) => r.json())
      .then((data) => {
        setTasks(data)
        if (data.length > 0) {
          setForm((f) => ({ ...f, taskId: data[0].id }))
        }
      })
  }, [])

  const selectedTask = tasks.find((t) => t.id === form.taskId)
  const model = selectedTask?.compensationModel

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast({ message: 'Salg registreret!', type: 'success' })
      setTimeout(() => router.push('/dashboard/sales'), 1500)
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Noget gik galt', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-2xl font-bold text-white mb-6">Registrer salg</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Opgave</label>
            <select
              value={form.taskId}
              onChange={(e) => set('taskId', e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Dato</label>
            <input
              type="date"
              value={form.saleDate}
              onChange={(e) => set('saleDate', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {model && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
            {model.type === 'fixed' && (
              <>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="text-blue-400">💡</span>
                  <span>{model.label} · {formatDKK(model.pricePerUnit)} per enhed</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-400 font-medium">Antal enheder</label>
                  <input
                    type="number"
                    min="1"
                    value={form.units}
                    onChange={(e) => set('units', e.target.value)}
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {model.type === 'percentage' && (
              <>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="text-green-400">💡</span>
                  <span>{model.label} · {model.percentage}% provision</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-400 font-medium">Deal-størrelse (DKK)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.dealSize}
                    onChange={(e) => set('dealSize', e.target.value)}
                    required
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {model.type === 'package' && (
              <>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="text-yellow-400">💡</span>
                  <span>{model.label}</span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400 font-medium">Vælg pakke</label>
                  {model.packages?.map((pkg) => (
                    <label
                      key={pkg.name}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                        form.packageName === pkg.name
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="package"
                          value={pkg.name}
                          checked={form.packageName === pkg.name}
                          onChange={() => set('packageName', pkg.name)}
                          className="text-blue-500"
                        />
                        <span className="text-white font-medium">{pkg.name}</span>
                      </div>
                      <span className="text-zinc-400 text-sm">{formatDKK(pkg.price)}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Note (valgfrit)</label>
            <textarea
              value={form.sellerNote}
              onChange={(e) => set('sellerNote', e.target.value)}
              rows={3}
              placeholder="Evt. note om salget..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !form.taskId || (model?.type === 'package' && !form.packageName)}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Gemmer...' : 'Registrer salg'}
        </button>
      </form>
    </div>
  )
}
