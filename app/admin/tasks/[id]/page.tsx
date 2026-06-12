'use client'

import { useEffect, useState } from 'react'
import { TaskForm } from '@/components/TaskForm'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

interface TaskData {
  id: string
  name: string
  clientName: string
  description?: string
  status: string
  startDate?: string
  endDate?: string
  compensationModel: {
    type: string
    label?: string
    pricePerUnit?: number
    percentage?: number
    packages?: { name: string; price: number }[]
  }
  assignments: { seller: { id: string } }[]
}

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<TaskData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/tasks/${params.id}`)
      .then((r) => r.json())
      .then(setTask)
      .finally(() => setLoading(false))
  }, [params.id])

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Rediger opgave</h1>
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : task ? (
        <TaskForm
          mode="edit"
          initialData={{
            id: task.id,
            name: task.name,
            clientName: task.clientName,
            description: task.description,
            status: task.status,
            startDate: task.startDate,
            endDate: task.endDate,
            compensationModel: task.compensationModel,
            assignedSellerIds: task.assignments.map((a) => a.seller.id),
          }}
        />
      ) : (
        <p className="text-zinc-500">Opgave ikke fundet</p>
      )}
    </div>
  )
}
