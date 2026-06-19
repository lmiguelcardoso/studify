'use client'

import { Edit2, HelpCircle, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Question, QuestionType } from '@/types'

interface QuestionCardProps {
  question: Question
  onEdit: (question: Question) => void
  onDelete: (question: Question) => void
}

const typeLabels: Record<QuestionType, string> = {
  multiple_choice: 'quiz.type.multiple_choice',
  true_false: 'quiz.type.true_false',
}

export function QuestionCard({ question, onEdit, onDelete }: QuestionCardProps) {
  const t = useTranslations('quiz')
  const common = useTranslations('common')

  return (
    <Card className="overflow-hidden rounded-md">
      <CardContent className="flex items-start gap-4 p-4">
        <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="line-clamp-2 text-sm font-medium">{question.text}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
              {t(typeLabels[question.type])}
            </span>
            <span className="text-xs text-muted-foreground">
              {question.options.length} {question.options.length === 1 ? t('options') : t('options')}
            </span>
            {question.explanation ? (
              <span className="text-xs text-muted-foreground">
                &middot; {t('explanation').toLowerCase()}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onEdit(question)}
            aria-label={common('edit')}
          >
            <Edit2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onDelete(question)}
            aria-label={common('delete')}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
