'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { enqueue, flushQueue } from '@/lib/sync/queue'
import type { Topic } from '@/types'

interface TopicsState {
  topics: Topic[]
  isLoaded: boolean
  load: () => Promise<void>
  add: (topic: Topic) => Promise<void>
  update: (id: string, patch: Partial<Topic>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useTopicsStore = create<TopicsState>()((set) => ({
  topics: [],
  isLoaded: false,
  load: async () => {
    const topics = await db.topics.toArray()
    set({ topics, isLoaded: true })
  },
  add: async (topic) => {
    await db.topics.add(topic)
    await enqueue('topics', 'INSERT', topic)
    if (navigator.onLine) await flushQueue()
    set((state) => ({ topics: [...state.topics, topic] }))
  },
  update: async (id, patch) => {
    const updated = { ...patch, updated_at: new Date().toISOString() }
    await db.topics.update(id, updated)
    await enqueue('topics', 'UPDATE', { id, ...updated })
    if (navigator.onLine) await flushQueue()
    set((state) => ({
      topics: state.topics.map((topic) => (topic.id === id ? { ...topic, ...updated } : topic)),
    }))
  },
  remove: async (id) => {
    await db.topics.delete(id)
    await enqueue('topics', 'DELETE', { id })
    if (navigator.onLine) await flushQueue()
    set((state) => ({ topics: state.topics.filter((topic) => topic.id !== id) }))
  },
}))
