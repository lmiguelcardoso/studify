'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { enqueue, flushQueue } from '@/lib/sync/queue'
import type { QuizSession, QuizAnswer } from '@/types'

interface QuizStore {
  createSession: (session: QuizSession) => Promise<void>
  submitAnswer: (answer: QuizAnswer) => Promise<void>
  finishSession: (id: string, correctAnswers: number) => Promise<void>
}

export const useQuizStore = create<QuizStore>()(() => ({
  createSession: async (session) => {
    await db.quizSessions.add(session)
    await enqueue('quiz_sessions', 'INSERT', session)
    if (navigator.onLine) await flushQueue()
  },
  submitAnswer: async (answer) => {
    await db.quizAnswers.add(answer)
    await enqueue('quiz_answers', 'INSERT', answer)
    if (navigator.onLine) await flushQueue()
  },
  finishSession: async (id, correctAnswers) => {
    const patch = {
      correct_answers: correctAnswers,
      finished_at: new Date().toISOString(),
    }
    await db.quizSessions.update(id, patch)
    await enqueue('quiz_sessions', 'UPDATE', { id, ...patch })
    if (navigator.onLine) await flushQueue()
  },
}))
