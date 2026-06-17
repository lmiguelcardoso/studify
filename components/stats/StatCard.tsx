import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: ReactNode
  detail?: string
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
      {detail ? <p className="mt-2 text-sm text-zinc-500">{detail}</p> : null}
    </div>
  )
}
