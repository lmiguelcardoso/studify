'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { FlashcardPile } from '@/types'

interface FlashcardResultsClientProps {
  topicId: string
}

interface StoredResult {
  cardsReviewed: number
  pileCounts: Record<FlashcardPile, number>
}

const piles: FlashcardPile[] = ['unknown', 'learning', 'known']

export function FlashcardResultsClient({ topicId }: FlashcardResultsClientProps) {
  const t = useTranslations('flashcards')
  const common = useTranslations('common')
  const [result] = useState<StoredResult | null>(() => {
    const stored = sessionStorage.getItem(`studify:flashcard-result:${topicId}`)
    if (stored) {
      return JSON.parse(stored) as StoredResult
    }
    return null
  })

  if (!result) {
    return <div className="mx-auto w-full max-w-screen-xl p-6 text-sm text-muted-foreground">{common('loading')}</div>
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-1 items-center p-6">
      <Card className="mx-auto w-full max-w-xl rounded-md">
        <CardContent className="space-y-6 p-6 text-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('result')}</p>
            <p className="mt-2 text-5xl font-bold">{result?.cardsReviewed ?? 0}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t('cardsReviewed')}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {piles.map((pile) => (
              <div key={pile} className="rounded-md border p-3">
                <p className="text-2xl font-semibold">{result.pileCounts[pile]}</p>
                <p className="text-xs text-muted-foreground">{t(`pile.${pile}`)}</p>
              </div>
            ))}
          </div>

          <Button asChild>
            <Link href={`/flashcards/${topicId}`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {t('reviewAgain')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
