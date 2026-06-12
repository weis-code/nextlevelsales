import { TaskForm } from '@/components/TaskForm'

export default function NewTaskPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Opret ny opgave</h1>
      <TaskForm mode="create" />
    </div>
  )
}
