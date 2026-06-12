import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar, BottomNav } from '@/components/Navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const role = (session.user as { role: string }).role

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar role={role} />
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav role={role} />
    </div>
  )
}
