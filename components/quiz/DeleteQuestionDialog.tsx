'use client'

import { Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types'

interface DeleteQuestionDialogProps {
  question: Question
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function DeleteQuestionDialog({
  question,
  isOpen,
  onCancel,
  onConfirm,
}: DeleteQuestionDialogProps) {
  const t = useTranslations('quiz')
  const common = useTranslations('common')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-md border bg-background p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t('deleteTitle')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('deleteDescription', { text: question.text })}
            </p>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={onCancel} aria-label={common('cancel')}>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {common('cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {common('delete')}
          </Button>
        </div>
      </div>
    </div>
  )
}
