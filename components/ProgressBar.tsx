'use client'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showPercent?: boolean
}

export function ProgressBar({ value, max, label, showPercent = true }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const color = pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 30 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>{label}</span>
          <span>
            {value} / {max} {showPercent && `(${pct}%)`}
          </span>
        </div>
      )}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
