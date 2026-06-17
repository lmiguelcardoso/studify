'use client'

import { RotateCcw, BookOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ResultsCardProps {
  topicId: string
  correctAnswers: number
  totalQuestions: number
}

export function ResultsCard({ topicId, correctAnswers, totalQuestions }: ResultsCardProps) {
  const t = useTranslations('quiz')
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  return (
    <Card className="mx-auto w-full max-w-xl rounded-md">
      <CardContent className="space-y-6 p-6 text-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('result')}</p>
          <p className="mt-2 text-5xl font-bold">{accuracy}%</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {correctAnswers} / {totalQuestions} · {t('accuracy')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/topics/${topicId}`}>
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {t('reviewTopic')}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/quiz/${topicId}`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {t('tryAgain')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
