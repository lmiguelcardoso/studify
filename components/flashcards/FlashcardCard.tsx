'use client'

import { Edit2, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Flashcard, FlashcardPile } from '@/types'

interface FlashcardCardProps {
  flashcard: Flashcard
  onEdit: () => void
  onDelete: () => void
}

const pileClassName: Record<FlashcardPile, string> = {
  unknown: 'border-rose-600 bg-rose-500/10 text-rose-700',
  learning: 'border-amber-600 bg-amber-500/10 text-amber-700',
  known: 'border-emerald-600 bg-emerald-500/10 text-emerald-700',
}

export function FlashcardCard({ flashcard, onEdit, onDelete }: FlashcardCardProps) {
  const t = useTranslations('flashcards')

  return (
    <Card className="rounded-md">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${pileClassName[flashcard.pile]}`}>
            {t(`pile.${flashcard.pile}`)}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              {t('editCard')}
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t('deleteCard')}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border bg-background p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{t('front')}</p>
            <p className="whitespace-pre-wrap text-sm">{flashcard.front}</p>
          </div>
          <div className="rounded-md border bg-background p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{t('back')}</p>
            <p className="whitespace-pre-wrap text-sm">{flashcard.back}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
