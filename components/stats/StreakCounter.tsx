type StreakCounterProps = {
  days: number
  label: string
  dayLabel: string
}

export function StreakCounter({ days, label, dayLabel }: StreakCounterProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-3xl font-semibold text-zinc-950">{days}</span>
        <span className="pb-1 text-sm font-medium text-zinc-500">
          {dayLabel}
        </span>
      </div>
    </div>
  )
}
