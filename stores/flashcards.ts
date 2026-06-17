'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'
import { enqueue, flushQueue } from '@/lib/sync/queue'
import type { Flashcard, FlashcardPile } from '@/types'

interface FlashcardsState {
  flashcards: Flashcard[]
  isLoaded: boolean
  load: () => Promise<void>
  loadByTopic: (topicId: string) => Promise<void>
  add: (flashcard: Flashcard) => Promise<void>
  update: (id: string, patch: Partial<Flashcard>) => Promise<void>
  moveToPile: (id: string, pile: FlashcardPile) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useFlashcardsStore = create<FlashcardsState>()((set) => ({
  flashcards: [],
  isLoaded: false,
  load: async () => {
    const flashcards = await db.flashcards.toArray()
    set({ flashcards, isLoaded: true })
  },
  loadByTopic: async (topicId) => {
    const flashcards = await db.flashcards.where('topic_id').equals(topicId).toArray()
    set({ flashcards, isLoaded: true })
  },
  add: async (flashcard) => {
    await db.flashcards.add(flashcard)
    await enqueue('flashcards', 'INSERT', flashcard)
    if (navigator.onLine) await flushQueue()
    set((state) => ({ flashcards: [...state.flashcards, flashcard] }))
  },
  update: async (id, patch) => {
    const updated = { ...patch, updated_at: new Date().toISOString() }
    await db.flashcards.update(id, updated)
    await enqueue('flashcards', 'UPDATE', { id, ...updated })
    if (navigator.onLine) await flushQueue()
    set((state) => ({
      flashcards: state.flashcards.map((flashcard) =>
        flashcard.id === id ? { ...flashcard, ...updated } : flashcard
      ),
    }))
  },
  moveToPile: async (id, pile) => {
    const patch = { pile, updated_at: new Date().toISOString() }
    await db.flashcards.update(id, patch)
    await enqueue('flashcards', 'UPDATE', { id, ...patch })
    if (navigator.onLine) await flushQueue()
    set((state) => ({
      flashcards: state.flashcards.map((flashcard) =>
        flashcard.id === id ? { ...flashcard, ...patch } : flashcard
      ),
    }))
  },
  remove: async (id) => {
    await db.flashcards.delete(id)
    await enqueue('flashcards', 'DELETE', { id })
    if (navigator.onLine) await flushQueue()
    set((state) => ({ flashcards: state.flashcards.filter((flashcard) => flashcard.id !== id) }))
  },
}))
