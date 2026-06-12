'use client'

interface KPICardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red'
}

const colorMap = {
  blue: 'from-blue-500/10 border-blue-500/20 text-blue-400',
  green: 'from-green-500/10 border-green-500/20 text-green-400',
  yellow: 'from-yellow-500/10 border-yellow-500/20 text-yellow-400',
  red: 'from-red-500/10 border-red-500/20 text-red-400',
}

export function KPICard({ label, value, sub, trend, icon, color = 'blue' }: KPICardProps) {
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-4 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wide">{label}</span>
        {icon && <span className="opacity-60">{icon}</span>}
      </div>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && (
          <span className={`text-sm mb-0.5 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-500'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          </span>
        )}
      </div>
      {sub && <span className="text-zinc-500 text-xs">{sub}</span>}
    </div>
  )
}
