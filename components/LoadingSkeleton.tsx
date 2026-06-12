'use client'

export function LoadingSkeleton({ rows = 4, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-zinc-800 rounded-xl" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-zinc-800/50 rounded-2xl p-4 h-28" />
  )
}
