'use client'

import { useTranslations } from 'next-intl'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const t = useTranslations('quiz')
  const progress = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-muted-foreground">
        <span>
          {t('question')} {current} {t('of')} {total}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
