'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FeedbackSlide } from '@/components/quiz/FeedbackSlide'
import { ProgressBar } from '@/components/quiz/ProgressBar'
import { QuestionSlide } from '@/components/quiz/QuestionSlide'
import { db } from '@/lib/db'
import { enqueue, flushQueue } from '@/lib/sync/queue'
import type { Question, QuizAnswer, QuizSession } from '@/types'

interface QuizPlayerProps {
  topicId: string
  userId: string
}

interface LocalAnswer {
  question_id: string
  selected_option_id: string | null
  is_correct: boolean
  answered_at: string
}

function shuffleQuestions(questions: Question[]) {
  const shuffled = [...questions]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  return shuffled
}

export function QuizPlayer({ topicId, userId }: QuizPlayerProps) {
  const t = useTranslations('quiz')
  const common = useTranslations('common')
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [answers, setAnswers] = useState<LocalAnswer[]>([])
  const [startedAt] = useState(() => new Date().toISOString())
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadQuestions() {
      const topicQuestions = await db.questions.where('topic_id').equals(topicId).toArray()
      setQuestions(shuffleQuestions(topicQuestions))
      setIsLoaded(true)
    }

    loadQuestions().catch(console.error)
  }, [topicId])

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const currentAnswer = useMemo(
    () => answers.find((answer) => answer.question_id === currentQuestion?.id),
    [answers, currentQuestion?.id]
  )

  function handleSelect(optionId: string) {
    if (!currentQuestion || showFeedback) return

    const selectedOption = currentQuestion.options.find((option) => option.id === optionId)
    setSelectedOptionId(optionId)
    setAnswers((current) => [
      ...current.filter((answer) => answer.question_id !== currentQuestion.id),
      {
        question_id: currentQuestion.id,
        selected_option_id: optionId,
        is_correct: selectedOption?.is_correct ?? false,
        answered_at: new Date().toISOString(),
      },
    ])
    setShowFeedback(true)
  }

  async function saveSession(finalAnswers: LocalAnswer[]) {
    const session: QuizSession = {
      id: crypto.randomUUID(),
      user_id: userId,
      topic_id: topicId,
      total_questions: questions.length,
      correct_answers: finalAnswers.filter((answer) => answer.is_correct).length,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    }

    const quizAnswers: QuizAnswer[] = finalAnswers.map((answer) => ({
      id: crypto.randomUUID(),
      session_id: session.id,
      question_id: answer.question_id,
      selected_option_id: answer.selected_option_id,
      is_correct: answer.is_correct,
      answered_at: answer.answered_at,
    }))

    await db.transaction('rw', [db.quizSessions, db.quizAnswers], async () => {
      await db.quizSessions.add(session)
      await db.quizAnswers.bulkAdd(quizAnswers)
    })

    await enqueue('quiz_sessions', 'INSERT', session)
    await Promise.all(quizAnswers.map((answer) => enqueue('quiz_answers', 'INSERT', answer)))
    if (navigator.onLine) await flushQueue()

    sessionStorage.setItem(
      `studify:quiz-result:${topicId}`,
      JSON.stringify({
        sessionId: session.id,
        correctAnswers: session.correct_answers,
        totalQuestions: session.total_questions,
      })
    )
  }

  async function handleNext() {
    if (!currentAnswer) return

    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1)
      setSelectedOptionId(null)
      setShowFeedback(false)
      return
    }

    setIsSaving(true)
    await saveSession(answers)
    router.push(`/quiz/${topicId}/results`)
  }

  if (!isLoaded) {
    return <div className="text-sm text-muted-foreground">{common('loading')}</div>
  }

  if (questions.length === 0) {
    return (
      <Card className="rounded-md">
        <CardContent className="space-y-4 p-6 text-center">
          <p className="font-medium">{t('noQuestions')}</p>
          <Button type="button" variant="outline" onClick={() => router.push(`/topics/${topicId}`)}>
            {t('reviewTopic')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <ProgressBar current={currentIndex + 1} total={questions.length} />
      <Card className="rounded-md">
        <CardContent className="p-6">
          {showFeedback && selectedOptionId ? (
            <FeedbackSlide
              question={currentQuestion}
              selectedOptionId={selectedOptionId}
              isLastQuestion={isLastQuestion}
              onNext={handleNext}
            />
          ) : (
            <QuestionSlide
              question={currentQuestion}
              selectedOptionId={selectedOptionId}
              onSelect={handleSelect}
            />
          )}
        </CardContent>
      </Card>
      {isSaving ? <p className="text-center text-sm text-muted-foreground">{t('savingResult')}</p> : null}
    </div>
  )
}
