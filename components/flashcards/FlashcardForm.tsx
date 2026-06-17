'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Flashcard } from '@/types'

interface FlashcardFormValues {
  front: string
  back: string
}

interface FlashcardFormProps {
  flashcard?: Flashcard
  onSubmit: (values: FlashcardFormValues) => Promise<void>
  onCancel?: () => void
}

export function FlashcardForm({ flashcard, onSubmit, onCancel }: FlashcardFormProps) {
  const t = useTranslations('flashcards')
  const common = useTranslations('common')
  const [front, setFront] = useState(flashcard?.front ?? '')
  const [back, setBack] = useState(flashcard?.back ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedFront = front.trim()
    const trimmedBack = back.trim()
    if (!trimmedFront || !trimmedBack) return

    setIsSubmitting(true)
    try {
      await onSubmit({ front: trimmedFront, back: trimmedBack })

      if (!flashcard) {
        setFront('')
        setBack('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-card p-4">
      <div className="grid gap-2">
        <Label htmlFor="flashcard-front">{t('front')}</Label>
        <textarea
          id="flashcard-front"
          value={front}
          onChange={(event) => setFront(event.target.value)}
          rows={3}
          required
          maxLength={480}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="flashcard-back">{t('back')}</Label>
        <textarea
          id="flashcard-back"
          value={back}
          onChange={(event) => setBack(event.target.value)}
          rows={3}
          required
          maxLength={720}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {common('cancel')}
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting || !front.trim() || !back.trim()}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {flashcard ? common('save') : common('create')}
        </Button>
      </div>
    </form>
  )
}
