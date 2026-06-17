'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { enqueue, flushQueue } from '@/lib/sync/queue'
import type { Question } from '@/types'

interface QuestionsState {
  questions: Question[]
  isLoaded: boolean
  load: () => Promise<void>
  loadByTopic: (topicId: string) => Promise<void>
  add: (question: Question) => Promise<void>
  update: (id: string, patch: Partial<Question>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useQuestionsStore = create<QuestionsState>()((set) => ({
  questions: [],
  isLoaded: false,
  load: async () => {
    const questions = await db.questions.toArray()
    set({ questions, isLoaded: true })
  },
  loadByTopic: async (topicId) => {
    const questions = await db.questions.where('topic_id').equals(topicId).toArray()
    set({ questions, isLoaded: true })
  },
  add: async (question) => {
    await db.questions.add(question)
    await enqueue('questions', 'INSERT', question)
    if (navigator.onLine) await flushQueue()
    set((state) => ({ questions: [...state.questions, question] }))
  },
  update: async (id, patch) => {
    const updated = { ...patch, updated_at: new Date().toISOString() }
    await db.questions.update(id, updated)
    await enqueue('questions', 'UPDATE', { id, ...updated })
    if (navigator.onLine) await flushQueue()
    set((state) => ({
      questions: state.questions.map((question) =>
        question.id === id ? { ...question, ...updated } : question
      ),
    }))
  },
  remove: async (id) => {
    await db.questions.delete(id)
    await enqueue('questions', 'DELETE', { id })
    if (navigator.onLine) await flushQueue()
    set((state) => ({ questions: state.questions.filter((question) => question.id !== id) }))
  },
}))
