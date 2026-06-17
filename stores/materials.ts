'use client'

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
    await enqueue('materials', 'INSERT', material)
    if (navigator.onLine) await flushQueue()
    set((state) => ({ materials: [...state.materials, material] }))
  },
  update: async (id, patch) => {
    const updated = { ...patch, updated_at: new Date().toISOString() }
    await db.materials.update(id, updated)
    await enqueue('materials', 'UPDATE', { id, ...updated })
    if (navigator.onLine) await flushQueue()
    set((state) => ({
      materials: state.materials.map((material) =>
        material.id === id ? { ...material, ...updated } : material
      ),
    }))
  },
  remove: async (id) => {
    await db.materials.delete(id)
    await enqueue('materials', 'DELETE', { id })
    if (navigator.onLine) await flushQueue()
    set((state) => ({ materials: state.materials.filter((material) => material.id !== id) }))
  },
}))
