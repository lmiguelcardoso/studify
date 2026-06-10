import { create } from 'zustand'
import { db } from '@/lib/db'
import { enqueue, flushQueue } from '@/lib/sync/queue'
import type { Material } from '@/types'

interface MaterialsState {
  materials: Material[]
  isLoaded: boolean
  load: () => Promise<void>
  loadByTopic: (topicId: string) => Promise<void>
  add: (material: Material) => Promise<void>
  update: (id: string, patch: Partial<Material>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useMaterialsStore = create<MaterialsState>()((set) => ({
  materials: [],
  isLoaded: false,

  load: async () => {
    const materials = await db.materials.toArray()
    set({ materials, isLoaded: true })
  },

  loadByTopic: async (topicId) => {
    const materials = await db.materials.where('topic_id').equals(topicId).toArray()
    set({ materials, isLoaded: true })
  },

  add: async (material) => {
    await db.materials.add(material)
    await enqueue('materials', 'INSERT', material as never)
    if (navigator.onLine) await flushQueue()
    set((s) => ({ materials: [...s.materials, material] }))
  },

  update: async (id, patch) => {
    const updated = { ...patch, updated_at: new Date().toISOString() }
    await db.materials.update(id, updated)
    await enqueue('materials', 'UPDATE', { id, ...updated } as never)
    if (navigator.onLine) await flushQueue()
    set((s) => ({
      materials: s.materials.map((m) => (m.id === id ? { ...m, ...updated } : m)),
    }))
  },

  remove: async (id) => {
    await db.materials.delete(id)
    await enqueue('materials', 'DELETE', { id } as never)
    if (navigator.onLine) await flushQueue()
    set((s) => ({ materials: s.materials.filter((m) => m.id !== id) }))
  },
}))
