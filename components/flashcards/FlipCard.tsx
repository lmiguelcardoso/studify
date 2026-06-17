'use client'

import { useTranslations } from 'next-intl'
import type { Flashcard } from '@/types'

interface FlipCardProps {
  flashcard: Flashcard
  isFlipped: boolean
  onFlip: () => void
}

export function FlipCard({ flashcard, isFlipped, onFlip }: FlipCardProps) {
  const t = useTranslations('flashcards')

  return (
    <button type="button" onClick={onFlip} className="perspective-1000 h-72 w-full text-left">
      <div className={`transform-style-3d relative h-full w-full transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div className="backface-hidden absolute inset-0 flex flex-col justify-center rounded-md border bg-card p-6 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">{t('front')}</p>
          <p className="whitespace-pre-wrap text-xl font-semibold leading-relaxed">{flashcard.front}</p>
          <p className="mt-6 text-sm text-muted-foreground">{t('flip')}</p>
        </div>
        <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-center rounded-md border bg-muted p-6 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">{t('back')}</p>
          <p className="whitespace-pre-wrap text-xl font-semibold leading-relaxed">{flashcard.back}</p>
        </div>
      </div>
    </button>
  )
}
