'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { FlashcardPile } from '@/types'

interface PileSelectorProps {
  onSelect: (pile: FlashcardPile) => void
}

const piles: FlashcardPile[] = ['unknown', 'learning', 'known']

export function PileSelector({ onSelect }: PileSelectorProps) {
  const t = useTranslations('flashcards')

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {piles.map((pile) => (
        <Button
          key={pile}
          type="button"
          variant={pile === 'unknown' ? 'destructive' : pile === 'learning' ? 'outline' : 'default'}
          onClick={() => onSelect(pile)}
        >
          {t(`pile.${pile}`)}
        </Button>
      ))}
    </div>
  )
}
