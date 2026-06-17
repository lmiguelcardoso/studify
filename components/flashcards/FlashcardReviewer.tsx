'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { FlipCard } from '@/components/flashcards/FlipCard'
import { PileSelector } from '@/components/flashcards/PileSelector'
import { ProgressBar } from '@/components/quiz/ProgressBar'
import { db } from '@/lib/db'
import { enqueue, flushQueue } from '@/lib/sync/queue'
import { useFlashcardsStore } from '@/stores/flashcards'
import type { Flashcard, FlashcardPile, FlashcardSession } from '@/types'

interface FlashcardReviewerProps {
  topicId: string
  userId: string
}

type PileCounts = Record<FlashcardPile, number>

const pileOrder: FlashcardPile[] = ['unknown', 'learning', 'known']

function orderCards(cards: Flashcard[]) {
  return [...cards].sort((a, b) => {
    const pileCompare = pileOrder.indexOf(a.pile) - pileOrder.indexOf(b.pile)
    return pileCompare === 0 ? a.created_at.localeCompare(b.created_at) : pileCompare
  })
}

export function FlashcardReviewer({ topicId, userId }: FlashcardReviewerProps) {
  const t = useTranslations('flashcards')
  const common = useTranslations('common')
  const router = useRouter()
  const { flashcards, isLoaded, loadByTopic, moveToPile } = useFlashcardsStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [startedAt] = useState(() => new Date().toISOString())
  const [pileCounts, setPileCounts] = useState<PileCounts>({ unknown: 0, learning: 0, known: 0 })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadByTopic(topicId)
  }, [loadByTopic, topicId])

  const cards = useMemo(
    () => orderCards(flashcards.filter((flashcard) => flashcard.topic_id === topicId)),
    [flashcards, topicId]
  )

  const currentCard = cards[currentIndex]
  const isLastCard = currentIndex === cards.length - 1
  const reviewedCount = useMemo(
    () => pileCounts.unknown + pileCounts.learning + pileCounts.known,
    [pileCounts]
  )

  async function saveSession(nextPileCounts: PileCounts) {
    const reviewedCards = nextPileCounts.unknown + nextPileCounts.learning + nextPileCounts.known
    const session: FlashcardSession = {
      id: crypto.randomUUID(),
      user_id: userId,
      topic_id: topicId,
      cards_reviewed: reviewedCards,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    }

    await db.flashcardSessions.add(session)
    await enqueue('flashcard_sessions', 'INSERT', session)
    if (navigator.onLine) await flushQueue()

    sessionStorage.setItem(
      `studify:flashcard-result:${topicId}`,
      JSON.stringify({
        sessionId: session.id,
        cardsReviewed: session.cards_reviewed,
        pileCounts: nextPileCounts,
      })
    )
  }

  async function handlePileSelect(pile: FlashcardPile) {
    if (!currentCard) return

    const nextPileCounts = {
      ...pileCounts,
      [pile]: pileCounts[pile] + 1,
    }
    setPileCounts(nextPileCounts)
    await moveToPile(currentCard.id, pile)

    if (isLastCard) {
      setIsSaving(true)
      await saveSession(nextPileCounts)
      router.push(`/flashcards/${topicId}/results`)
      return
    }

    setCurrentIndex((index) => index + 1)
    setIsFlipped(false)
  }

  if (!isLoaded) {
    return <div className="text-sm text-muted-foreground">{common('loading')}</div>
  }

  if (!currentCard) {
    return (
      <div className="rounded-md border border-dashed p-10 text-center">
        <p className="font-medium">{t('noCards')}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => router.push(`/topics/${topicId}`)}>
          {t('reviewTopic')}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <ProgressBar current={currentIndex + 1} total={cards.length} />
      <FlipCard flashcard={currentCard} isFlipped={isFlipped} onFlip={() => setIsFlipped((value) => !value)} />
      {isFlipped ? <PileSelector onSelect={handlePileSelect} /> : null}
      <p className="text-center text-sm text-muted-foreground">
        {reviewedCount} / {cards.length} {t('reviewed')}
      </p>
      {isSaving ? <p className="text-center text-sm text-muted-foreground">{t('savingResult')}</p> : null}
    </div>
  )
}
