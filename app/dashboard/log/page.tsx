'use client'

import { useEffect, useState } from 'react'
import { Toast } from '@/components/Toast'

interface Task {
  id: string
  name: string
  compensationModel: { type: string }
}

export default function LogPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm] = useState({
    taskId: '',
    logDate: new Date().toISOString().split('T')[0],
    callsMade: '',
    contactsReached: '',
    meetingsBooked: '',
    meetingsHeld: '',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/tasks?mine=true')
      .then((r) => r.json())
      .then((data) => {
        setTasks(data)
        if (data.length > 0) setForm((f) => ({ ...f, taskId: data[0].id }))
      })
  }, [])

  const selectedTask = tasks.find((t) => t.id === form.taskId)
  const hasMeetings = selectedTask?.compensationModel?.type !== 'percentage'

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          callsMade: parseInt(form.callsMade) || 0,
          contactsReached: parseInt(form.contactsReached) || 0,
          meetingsBooked: parseInt(form.meetingsBooked) || 0,
          meetingsHeld: parseInt(form.meetingsHeld) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast({ message: 'Aktivitet logget!', type: 'success' })
      setForm((f) => ({
        ...f,
        callsMade: '',
        contactsReached: '',
        meetingsBooked: '',
        meetingsHeld: '',
        notes: '',
      }))
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Noget gik galt', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-2xl font-bold text-white mb-6">Log dagens aktivitet</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Dato</label>
            <input
              type="date"
              value={form.logDate}
              onChange={(e) => set('logDate', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Opgave</label>
            <select
              value={form.taskId}
              onChange={(e) => set('taskId', e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {tasks.length === 0 && <option value="">Ingen opgaver tilknyttet</option>}
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Aktivitet</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 font-medium">Opkald foretaget</label>
              <input
                type="number"
                min="0"
                value={form.callsMade}
                onChange={(e) => set('callsMade', e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 font-medium">Kontakter nået</label>
              <input
                type="number"
                min="0"
                value={form.contactsReached}
                onChange={(e) => set('contactsReached', e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {hasMeetings && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-400 font-medium">Møder booket</label>
                  <input
                    type="number"
                    min="0"
                    value={form.meetingsBooked}
                    onChange={(e) => set('meetingsBooked', e.target.value)}
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-400 font-medium">Møder afholdt</label>
                  <input
                    type="number"
                    min="0"
                    value={form.meetingsHeld}
                    onChange={(e) => set('meetingsHeld', e.target.value)}
                    placeholder="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium">Note (valgfrit)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Skriv en note..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !form.taskId}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Gemmer...' : 'Gem aktivitet'}
        </button>
      </form>
    </div>
  )
}
