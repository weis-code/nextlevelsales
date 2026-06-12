'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toast } from './Toast'
import { formatDKK } from '@/lib/utils'

interface Package {
  name: string
  price: number
}

interface Seller {
  id: string
  fullName: string
  email: string
}

interface TaskFormProps {
  initialData?: {
    id?: string
    name?: string
    clientName?: string
    description?: string
    status?: string
    startDate?: string
    endDate?: string
    compensationModel?: {
      type: string
      label?: string
      pricePerUnit?: number
      percentage?: number
      packages?: Package[]
    }
    assignedSellerIds?: string[]
  }
  mode: 'create' | 'edit'
}

export function TaskForm({ initialData, mode }: TaskFormProps) {
  const router = useRouter()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    clientName: initialData?.clientName ?? '',
    description: initialData?.description ?? '',
    status: initialData?.status ?? 'ACTIVE',
    startDate: initialData?.startDate?.split('T')[0] ?? '',
    endDate: initialData?.endDate?.split('T')[0] ?? '',
    modelType: initialData?.compensationModel?.type ?? 'fixed',
    label: initialData?.compensationModel?.label ?? '',
    pricePerUnit: String(initialData?.compensationModel?.pricePerUnit ?? ''),
    percentage: String(initialData?.compensationModel?.percentage ?? ''),
    packages: (initialData?.compensationModel?.packages ?? [{ name: '', price: 0 }]) as Package[],
    sellerIds: initialData?.assignedSellerIds ?? [] as string[],
  })

  useEffect(() => {
    fetch('/api/sellers').then((r) => r.json()).then(setSellers)
  }, [])

  function setField(key: string, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function addPackage() {
    setForm((f) => ({ ...f, packages: [...f.packages, { name: '', price: 0 }] }))
  }

  function removePackage(i: number) {
    setForm((f) => ({ ...f, packages: f.packages.filter((_, idx) => idx !== i) }))
  }

  function updatePackage(i: number, field: 'name' | 'price', val: string) {
    setForm((f) => {
      const packages = [...f.packages]
      packages[i] = { ...packages[i], [field]: field === 'price' ? parseFloat(val) || 0 : val }
      return { ...f, packages }
    })
  }

  function toggleSeller(id: string) {
    setForm((f) => ({
      ...f,
      sellerIds: f.sellerIds.includes(id) ? f.sellerIds.filter((s) => s !== id) : [...f.sellerIds, id],
    }))
  }

  function buildCompensationModel() {
    if (form.modelType === 'fixed') {
      return { type: 'fixed', label: form.label, pricePerUnit: parseFloat(form.pricePerUnit) || 0 }
    }
    if (form.modelType === 'percentage') {
      return { type: 'percentage', label: form.label, percentage: parseFloat(form.percentage) || 0 }
    }
    return { type: 'package', label: form.label, packages: form.packages }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = mode === 'edit' ? `/api/tasks/${initialData?.id}` : '/api/tasks'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          clientName: form.clientName,
          description: form.description,
          status: form.status,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          compensationModel: buildCompensationModel(),
          sellerIds: form.sellerIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast({ message: mode === 'create' ? 'Opgave oprettet!' : 'Opgave opdateret!', type: 'success' })
      setTimeout(() => router.push('/admin/tasks'), 1500)
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Noget gik galt', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  const sectionCls = 'bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4'

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className={sectionCls}>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Grundoplysninger</p>
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400 font-medium">Opgavenavn</label>
          <input type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} required className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400 font-medium">Kundenavn</label>
          <input type="text" value={form.clientName} onChange={(e) => setField('clientName', e.target.value)} required className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400 font-medium">Beskrivelse (valgfrit)</label>
          <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={2} className={inputCls + ' resize-none'} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Startdato</label>
            <input type="date" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Slutdato</label>
            <input type="date" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} className={inputCls} />
          </div>
        </div>
        {mode === 'edit' && (
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Status</label>
            <select value={form.status} onChange={(e) => setField('status', e.target.value)} className={inputCls}>
              <option value="ACTIVE">Aktiv</option>
              <option value="PAUSED">Pause</option>
              <option value="COMPLETED">Afsluttet</option>
            </select>
          </div>
        )}
      </div>

      <div className={sectionCls}>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Kompensationsmodel</p>
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400 font-medium">Type</label>
          <select value={form.modelType} onChange={(e) => setField('modelType', e.target.value)} className={inputCls}>
            <option value="fixed">Fast pris per enhed</option>
            <option value="percentage">Provision (procentdel)</option>
            <option value="package">Pakkemodel</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400 font-medium">Label (hvad der sælges)</label>
          <input type="text" value={form.label} onChange={(e) => setField('label', e.target.value)} placeholder="f.eks. Møde booket" className={inputCls} />
        </div>

        {form.modelType === 'fixed' && (
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Pris per enhed (DKK)</label>
            <input type="number" min="0" value={form.pricePerUnit} onChange={(e) => setField('pricePerUnit', e.target.value)} placeholder="500" className={inputCls} />
          </div>
        )}

        {form.modelType === 'percentage' && (
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Provisionsprocent (%)</label>
            <input type="number" min="0" max="100" step="0.5" value={form.percentage} onChange={(e) => setField('percentage', e.target.value)} placeholder="10" className={inputCls} />
          </div>
        )}

        {form.modelType === 'package' && (
          <div className="space-y-3">
            <label className="text-sm text-zinc-400 font-medium">Pakker</label>
            {form.packages.map((pkg, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={pkg.name}
                  onChange={(e) => updatePackage(i, 'name', e.target.value)}
                  placeholder="Pakkenavn"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  value={pkg.price || ''}
                  onChange={(e) => updatePackage(i, 'price', e.target.value)}
                  placeholder="Pris"
                  className="w-28 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <button type="button" onClick={() => removePackage(i)} className="text-red-400 hover:text-red-300 px-2">✕</button>
              </div>
            ))}
            <button type="button" onClick={addPackage} className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
              + Tilføj pakke
            </button>
          </div>
        )}
      </div>

      <div className={sectionCls}>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Tilknyt sælgere</p>
        <div className="space-y-2">
          {sellers.map((seller) => (
            <label key={seller.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.sellerIds.includes(seller.id)}
                onChange={() => toggleSeller(seller.id)}
                className="w-4 h-4 rounded text-blue-500 bg-zinc-700 border-zinc-600"
              />
              <span className="text-white text-sm">{seller.fullName}</span>
              <span className="text-zinc-500 text-xs">{seller.email}</span>
            </label>
          ))}
          {sellers.length === 0 && <p className="text-zinc-500 text-sm">Ingen sælgere oprettet endnu</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Gemmer...' : mode === 'create' ? 'Opret opgave' : 'Gem ændringer'}
      </button>
    </form>
  )
}
