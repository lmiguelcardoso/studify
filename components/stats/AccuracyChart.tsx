'use client'

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AccuracyPoint } from '@/lib/stats'

type AccuracyChartProps = {
  data: AccuracyPoint[]
}

export function AccuracyChart({ data }: AccuracyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(date) => String(date).slice(5)}
          tickLine={false}
          axisLine={false}
          stroke="#71717a"
        />
        <YAxis
          domain={[0, 100]}
          unit="%"
          tickLine={false}
          axisLine={false}
          stroke="#71717a"
        />
        <Tooltip formatter={(value) => `${value}%`} />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
