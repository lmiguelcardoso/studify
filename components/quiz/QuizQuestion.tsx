'use client'

import { Check, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Question } from '@/types'

interface QuizQuestionProps {
  question: Question
  currentIndex: number
  totalQuestions: number
  answeredOptionId: string | null
  onAnswer: (optionId: string, isCorrect: boolean) => void
  onNext: () => void
  isLastQuestion: boolean
}

export function QuizQuestion({
  question,
  currentIndex,
  totalQuestions,
  answeredOptionId,
  onAnswer,
  onNext,
  isLastQuestion,
}: QuizQuestionProps) {
  const t = useTranslations('quiz')
  const common = useTranslations('common')

  const hasAnswered = answeredOptionId !== null
  const correctOption = question.options.find((opt) => opt.is_correct)
  const isCorrectAnswer =
    hasAnswered && answeredOptionId === correctOption?.id

  function handleSelect(optionId: string) {
    if (hasAnswered) return
    const option = question.options.find((o) => o.id === optionId)
    onAnswer(optionId, option?.is_correct ?? false)
  }

  function getOptionClass(optionId: string) {
    if (!hasAnswered) {
      return answeredOptionId === optionId
        ? 'border-primary bg-primary/5'
        : 'border-input hover:border-primary/50 hover:bg-muted'
    }

    if (optionId === correctOption?.id) {
      return 'border-green-500 bg-green-50 text-green-800'
    }

    if (optionId === answeredOptionId && !isCorrectAnswer) {
      return 'border-red-500 bg-red-50 text-red-800'
    }

    return 'border-input opacity-60'
  }

  function getIcon(optionId: string) {
    if (!hasAnswered) return null

    if (optionId === correctOption?.id) {
      return <Check className="h-5 w-5 shrink-0 text-green-600" />
    }

    if (optionId === answeredOptionId && !isCorrectAnswer) {
      return <X className="h-5 w-5 shrink-0 text-red-600" />
    }

    return null
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6 pt-12">
      <header className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('questionProgress', {
            current: currentIndex + 1,
            total: totalQuestions,
          })}
        </p>
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
          {question.type === 'multiple_choice'
            ? t('type.multiple_choice')
            : t('type.true_false')}
        </span>
      </header>

      <Card>
        <CardContent className="p-6">
          <p className="text-lg font-medium leading-relaxed">
            {question.text}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={hasAnswered}
            onClick={() => handleSelect(option.id)}
            className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${getOptionClass(option.id)}`}
          >
            <span className="flex-1">{option.text}</span>
            {getIcon(option.id)}
          </button>
        ))}
      </div>

      {hasAnswered && question.explanation ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-800">
              {t('explanation')}:
            </p>
            <p className="mt-1 text-sm text-blue-700">
              {question.explanation}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {hasAnswered ? (
        <div className="flex justify-end">
          <Button type="button" onClick={onNext}>
            {isLastQuestion ? common('finish') : t('nextQuestion')}
          </Button>
        </div>
      ) : null}
    </main>
  )
}
