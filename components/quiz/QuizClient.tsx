'use client'

import { useCallback, useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { useQuizStore } from '@/stores/quiz'
import { QuizSetup } from './QuizSetup'
import { QuizQuestion } from './QuizQuestion'
import { QuizResults } from './QuizResults'
import type { Question, Topic } from '@/types'

type QuizPhase = 'setup' | 'active' | 'results'

interface QuizClientProps {
  userId: string
}

export function QuizClient({ userId }: QuizClientProps) {
  const { createSession, submitAnswer, finishSession } = useQuizStore()

  const [phase, setPhase] = useState<QuizPhase>('setup')
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Map<string, { selectedOptionId: string | null; isCorrect: boolean }>
  >(new Map())
  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    db.topics.toArray().then(setTopics)
  }, [])

  const handleStart = useCallback(
    async (topicId: string) => {
      const topicQuestions = await db.questions
        .where('topic_id')
        .equals(topicId)
        .toArray()
      if (topicQuestions.length === 0) return

      const now = new Date().toISOString()
      const id = crypto.randomUUID()
      const session = {
        id,
        user_id: userId,
        topic_id: topicId,
        total_questions: topicQuestions.length,
        correct_answers: 0,
        started_at: now,
        finished_at: null,
      }

      await createSession(session)

      setSelectedTopicId(topicId)
      setQuestions(topicQuestions)
      setSessionId(id)
      setCurrentIndex(0)
      setCorrectCount(0)
      setAnsweredQuestions(new Map())
      setPhase('active')
    },
    [userId, createSession],
  )

  const handleAnswer = useCallback(
    async (optionId: string, isCorrect: boolean) => {
      if (!sessionId) return

      const question = questions[currentIndex]

      setAnsweredQuestions((prev) => {
        const next = new Map(prev)
        next.set(question.id, { selectedOptionId: optionId, isCorrect })
        return next
      })

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1)
      }

      const answer = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        question_id: question.id,
        selected_option_id: optionId,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      }

      await submitAnswer(answer)
    },
    [sessionId, questions, currentIndex, submitAnswer],
  )

  const handleNext = useCallback(async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      if (sessionId) {
        await finishSession(sessionId, correctCount)
      }
      setPhase('results')
    }
  }, [currentIndex, questions.length, sessionId, correctCount, finishSession])

  const handleRestart = useCallback(() => {
    setPhase('setup')
    setQuestions([])
    setSelectedTopicId(null)
    setCurrentIndex(0)
    setSessionId(null)
    setCorrectCount(0)
    setAnsweredQuestions(new Map())
  }, [])

  const topicName =
    topics.find((t) => t.id === selectedTopicId)?.name ?? ''

  if (phase === 'active' && questions[currentIndex]) {
    return (
      <QuizQuestion
        question={questions[currentIndex]}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        answeredOptionId={
          answeredQuestions.get(questions[currentIndex].id)
            ?.selectedOptionId ?? null
        }
        onAnswer={handleAnswer}
        onNext={handleNext}
        isLastQuestion={currentIndex === questions.length - 1}
      />
    )
  }

  if (phase === 'results') {
    return (
      <QuizResults
        correctAnswers={correctCount}
        totalQuestions={questions.length}
        topicName={topicName}
        onRestart={handleRestart}
      />
    )
  }

  return <QuizSetup userId={userId} onStart={handleStart} />
}
