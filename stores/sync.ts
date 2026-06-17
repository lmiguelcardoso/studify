'use client'

import { create } from 'zustand'
import { db } from '@/lib/db'

interface SyncState {
  isOnline: boolean
  pendingCount: number
  setOnline: (isOnline: boolean) => void
  refreshPendingCount: () => Promise<void>
}

export const useSyncStore = create<SyncState>()((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  setOnline: (isOnline) => set({ isOnline }),
  refreshPendingCount: async () => {
    const pendingCount = await db.syncQueue.count()
    set({ pendingCount })
  },
}))
