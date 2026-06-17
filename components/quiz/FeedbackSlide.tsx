'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types'

interface FeedbackSlideProps {
  question: Question
  selectedOptionId: string
  isLastQuestion: boolean
  onNext: () => void
}

export function FeedbackSlide({
  question,
  selectedOptionId,
  isLastQuestion,
  onNext,
}: FeedbackSlideProps) {
  const t = useTranslations('quiz')
  const common = useTranslations('common')
  const selectedOption = question.options.find((option) => option.id === selectedOptionId)
  const isCorrect = selectedOption?.is_correct ?? false

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        {isCorrect ? (
          <CheckCircle2 className="h-7 w-7 text-emerald-600" aria-hidden="true" />
        ) : (
          <XCircle className="h-7 w-7 text-rose-600" aria-hidden="true" />
        )}
        <h2 className="text-xl font-semibold">{isCorrect ? t('correct') : t('incorrect')}</h2>
      </div>

      <div className="grid gap-3">
        {question.options.map((option) => {
          const isSelected = option.id === selectedOptionId
          const stateClass = option.is_correct
            ? 'border-emerald-600 bg-emerald-500/10'
            : isSelected
              ? 'border-rose-600 bg-rose-500/10'
              : 'bg-card'

          return (
            <div key={option.id} className={`rounded-md border p-4 text-sm font-medium ${stateClass}`}>
              {option.text}
            </div>
          )
        })}
      </div>

      {question.explanation ? (
        <div className="rounded-md border bg-muted p-4">
          <h3 className="text-sm font-semibold">{t('explanation')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{question.explanation}</p>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="button" onClick={onNext}>
          {isLastQuestion ? common('finish') : common('next')}
        </Button>
      </div>
    </div>
  )
}
