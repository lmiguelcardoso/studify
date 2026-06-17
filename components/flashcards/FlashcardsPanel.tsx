'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DeleteFlashcardDialog } from '@/components/flashcards/DeleteFlashcardDialog'
import { FlashcardCard } from '@/components/flashcards/FlashcardCard'
import { FlashcardForm } from '@/components/flashcards/FlashcardForm'
import { useFlashcardsStore } from '@/stores/flashcards'
import type { Flashcard, FlashcardPile } from '@/types'

interface FlashcardsPanelProps {
  topicId: string
  userId: string
}

interface FlashcardFormValues {
  front: string
  back: string
}

const pileOrder: FlashcardPile[] = ['unknown', 'learning', 'known']

export function FlashcardsPanel({ topicId, userId }: FlashcardsPanelProps) {
  const t = useTranslations('flashcards')
  const { flashcards, isLoaded, loadByTopic, add, update, remove } = useFlashcardsStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingFlashcardId, setEditingFlashcardId] = useState<string | null>(null)
  const [deletingFlashcardId, setDeletingFlashcardId] = useState<string | null>(null)

  useEffect(() => {
    loadByTopic(topicId)
  }, [loadByTopic, topicId])

  const topicFlashcards = useMemo(
    () =>
      flashcards
        .filter((flashcard) => flashcard.topic_id === topicId)
        .sort((a, b) => {
          const pileCompare = pileOrder.indexOf(a.pile) - pileOrder.indexOf(b.pile)
          return pileCompare === 0 ? a.created_at.localeCompare(b.created_at) : pileCompare
        }),
    [flashcards, topicId]
  )
  const editingFlashcard = topicFlashcards.find((flashcard) => flashcard.id === editingFlashcardId)
  const deletingFlashcard = topicFlashcards.find((flashcard) => flashcard.id === deletingFlashcardId)

  async function handleCreate(values: FlashcardFormValues) {
    const now = new Date().toISOString()
    const flashcard: Flashcard = {
      id: crypto.randomUUID(),
      user_id: userId,
      topic_id: topicId,
      question_id: null,
      front: values.front,
      back: values.back,
      pile: 'unknown',
      created_at: now,
      updated_at: now,
    }

    await add(flashcard)
    setIsCreating(false)
  }

  async function handleUpdate(values: FlashcardFormValues) {
    if (!editingFlashcard) return

    await update(editingFlashcard.id, {
      front: values.front,
      back: values.back,
    })
    setEditingFlashcardId(null)
  }

  async function handleDelete() {
    if (!deletingFlashcard) return

    await remove(deletingFlashcard.id)
    setDeletingFlashcardId(null)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button type="button" variant="outline" onClick={() => setIsCreating((value) => !value)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('newCard')}
        </Button>
      </div>

      {isCreating ? <FlashcardForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} /> : null}

      {editingFlashcard ? (
        <FlashcardForm
          flashcard={editingFlashcard}
          onSubmit={handleUpdate}
          onCancel={() => setEditingFlashcardId(null)}
        />
      ) : null}

      {isLoaded && topicFlashcards.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t('noCards')}
        </div>
      ) : null}

      <div className="space-y-3">
        {topicFlashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={() => setEditingFlashcardId(flashcard.id)}
            onDelete={() => setDeletingFlashcardId(flashcard.id)}
          />
        ))}
      </div>

      {deletingFlashcard ? (
        <DeleteFlashcardDialog
          flashcard={deletingFlashcard}
          isOpen={!!deletingFlashcard}
          onCancel={() => setDeletingFlashcardId(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </section>
  )
}
