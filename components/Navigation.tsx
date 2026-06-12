'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const sellerLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { href: '/dashboard/log', label: 'Log', icon: '📋' },
  { href: '/dashboard/sales', label: 'Salg', icon: '💰' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: '🏆' },
]

const adminLinks = [
  { href: '/admin', label: 'Overblik', icon: '📊' },
  { href: '/admin/tasks', label: 'Opgaver', icon: '📁' },
  { href: '/admin/sellers', label: 'Sælgere', icon: '👥' },
  { href: '/admin/periods', label: 'Perioder', icon: '📅' },
  { href: '/admin/targets', label: 'Mål', icon: '🎯' },
  { href: '/admin/revenue', label: 'Omsætning', icon: '💹' },
]

interface NavigationProps {
  role: string
}

export function BottomNav({ role }: NavigationProps) {
  const pathname = usePathname()
  const links = sellerLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 md:hidden">
      <div className="flex">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors',
                active ? 'text-blue-400' : 'text-zinc-500'
              )}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          )
        })}
        {(role === 'ADMIN' || role === 'MANAGER') && (
          <Link
            href="/admin"
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors',
              pathname.startsWith('/admin') ? 'text-blue-400' : 'text-zinc-500'
            )}
          >
            <span className="text-lg">⚙️</span>
            <span>Admin</span>
          </Link>
        )}
      </div>
    </nav>
  )
}

export function Sidebar({ role }: NavigationProps) {
  const pathname = usePathname()
  const isAdmin = role === 'ADMIN' || role === 'MANAGER'

  return (
    <aside className="hidden md:flex flex-col w-60 bg-zinc-900 border-r border-zinc-800 min-h-screen p-4 gap-1 fixed top-0 left-0 z-30">
      <div className="flex items-center gap-2 px-3 py-3 mb-4">
        <span className="text-blue-400 text-xl font-bold">⚡</span>
        <span className="font-bold text-white text-lg">Next Level Sales</span>
      </div>

      <div className="text-xs text-zinc-500 uppercase tracking-wider px-3 mb-1">Sælger</div>
      {sellerLinks.map((link) => {
        const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href) && !pathname.startsWith('/admin'))
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              active ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            )}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        )
      })}

      {isAdmin && (
        <>
          <div className="text-xs text-zinc-500 uppercase tracking-wider px-3 mt-4 mb-1">Admin</div>
          {adminLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  active ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </>
      )}

      <div className="mt-auto pt-4 border-t border-zinc-800">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span>🚪</span> Log ud
        </button>
      </div>
    </aside>
  )
}
