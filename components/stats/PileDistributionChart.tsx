'use client'

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PileDistribution } from '@/lib/stats'

type PileDistributionChartProps = {
  distribution: PileDistribution
  labels: {
    unknown: string
    learning: string
    known: string
  }
}

export function PileDistributionChart({
  distribution,
  labels,
}: PileDistributionChartProps) {
  const data = [
    { name: labels.unknown, value: distribution.unknown, color: '#dc2626' },
    { name: labels.learning, value: distribution.learning, color: '#d97706' },
    { name: labels.known, value: distribution.known, color: '#16a34a' },
  ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          stroke="#71717a"
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          stroke="#71717a"
        />
        <Tooltip />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
