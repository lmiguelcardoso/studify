'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ResultsCard } from '@/components/quiz/ResultsCard'
import { db } from '@/lib/db'

interface QuizResultsClientProps {
  topicId: string
}

interface StoredResult {
  correctAnswers: number
  totalQuestions: number
}

export function QuizResultsClient({ topicId }: QuizResultsClientProps) {
  const common = useTranslations('common')
  const [result, setResult] = useState<StoredResult | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function loadResult() {
      const stored = sessionStorage.getItem(`studify:quiz-result:${topicId}`)
      if (stored) {
        setResult(JSON.parse(stored) as StoredResult)
        setIsLoaded(true)
        return
      }

      const sessions = await db.quizSessions.where('topic_id').equals(topicId).toArray()
      const session = sessions.sort((a, b) => b.started_at.localeCompare(a.started_at))[0]
      if (session) {
        setResult({
          correctAnswers: session.correct_answers,
          totalQuestions: session.total_questions,
        })
      }
      setIsLoaded(true)
    }

    loadResult().catch(console.error)
  }, [topicId])

  if (!isLoaded) {
    return <div className="mx-auto w-full max-w-screen-xl p-6 text-sm text-muted-foreground">{common('loading')}</div>
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-1 items-center p-6">
      <ResultsCard
        topicId={topicId}
        correctAnswers={result?.correctAnswers ?? 0}
        totalQuestions={result?.totalQuestions ?? 0}
      />
    </div>
  )
}
