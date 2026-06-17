'use client'

import { Edit2, Layers, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  onEdit: () => void
  onDelete: () => void
}

export function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  const t = useTranslations('quiz')
  const correctOption = question.options.find((option) => option.is_correct)

  return (
    <Card className="rounded-md">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <span className="inline-flex rounded-full border px-2 py-1 text-xs font-medium text-muted-foreground">
              {t(`type.${question.type}`)}
            </span>
            <h3 className="text-base font-semibold">{question.text}</h3>
            {correctOption ? (
              <p className="text-sm text-muted-foreground">
                {t('correctAnswer')}: {correctOption.text}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4" aria-hidden="true" />
              {t('editQuestion')}
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t('deleteQuestion')}
            </Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`rounded-md border px-3 py-2 text-sm ${
                option.is_correct ? 'border-primary bg-primary/10' : 'bg-background'
              }`}
            >
              {option.text}
            </div>
          ))}
        </div>

        {question.explanation ? (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{question.explanation}</p>
        ) : null}

        <Button type="button" variant="ghost" size="sm" disabled className="px-0">
          <Layers className="h-4 w-4" aria-hidden="true" />
          {t('convertToFlashcard')}
        </Button>
      </CardContent>
    </Card>
  )
}
