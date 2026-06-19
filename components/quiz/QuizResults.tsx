'use client'

import { Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface QuizResultsProps {
  correctAnswers: number
  totalQuestions: number
  topicName: string
  onRestart: () => void
}

export function QuizResults({
  correctAnswers,
  totalQuestions,
  topicName,
  onRestart,
}: QuizResultsProps) {
  const t = useTranslations('quiz')
  const accuracy = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6 pt-12">
      <header className="text-center">
        <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
        <h1 className="mt-3 text-2xl font-semibold">
          {t('quizCompleted')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{topicName}</p>
      </header>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <p className="text-5xl font-bold text-primary">{accuracy}%</p>
          <p className="text-lg text-muted-foreground">
            {t('correctAnswers', {
              correct: correctAnswers,
              total: totalQuestions,
            })}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Button type="button" size="lg" onClick={onRestart}>
          {t('startNewQuiz')}
        </Button>
      </div>
    </main>
  )
}
