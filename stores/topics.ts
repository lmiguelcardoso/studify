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
    await enqueue('topics', 'INSERT', topic as never)
    if (navigator.onLine) await flushQueue()
    set((s) => ({ topics: [...s.topics, topic] }))
  },

  update: async (id, patch) => {
    const updated = { ...patch, updated_at: new Date().toISOString() }
    await db.topics.update(id, updated)
    await enqueue('topics', 'UPDATE', { id, ...updated } as never)
    if (navigator.onLine) await flushQueue()
    set((s) => ({
      topics: s.topics.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    }))
  },

  remove: async (id) => {
    await db.topics.delete(id)
    await enqueue('topics', 'DELETE', { id } as never)
    if (navigator.onLine) await flushQueue()
    set((s) => ({ topics: s.topics.filter((t) => t.id !== id) }))
  },
}))
