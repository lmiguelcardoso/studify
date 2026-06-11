'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'

interface SyncState {
  isOnline: boolean
  pendingCount: number
  setOnline: (v: boolean) => void
  refreshPendingCount: () => Promise<void>
}

export const useSyncStore = create<SyncState>()((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,

  setOnline: (isOnline) => set({ isOnline }),

  refreshPendingCount: async () => {
    const count = await db.syncQueue.count()
    set({ pendingCount: count })
  },
}))
