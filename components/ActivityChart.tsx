'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartPoint {
  date: string
  calls: number
}

export function ActivityChart({ data }: { data: ChartPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit' }),
  }))

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#fff' }}
            cursor={{ fill: 'rgba(59,130,246,0.08)' }}
          />
          <Bar dataKey="calls" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Opkald" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
