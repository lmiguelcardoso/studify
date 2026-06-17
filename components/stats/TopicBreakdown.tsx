import type { TopicAccuracy } from '@/lib/stats'

type TopicBreakdownProps = {
  rows: TopicAccuracy[]
  labels: {
    topic: string
    accuracy: string
    sessions: string
  }
}

export function TopicBreakdown({ rows, labels }: TopicBreakdownProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-semibold">{labels.topic}</th>
            <th className="px-4 py-3 font-semibold">{labels.accuracy}</th>
            <th className="px-4 py-3 font-semibold">{labels.sessions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((row) => (
            <tr key={row.topicId}>
              <td className="px-4 py-3 font-medium text-zinc-950">
                {row.topicName}
              </td>
              <td className="px-4 py-3 text-zinc-700">{row.accuracy}%</td>
              <td className="px-4 py-3 text-zinc-700">{row.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
