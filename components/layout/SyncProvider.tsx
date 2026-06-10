'use client'

import { useEffect } from 'react'
import { startSyncListener, flushQueue } from '@/lib/sync/queue'
import { seedLocalDB } from '@/lib/db/seed'
import { useSyncStore } from '@/stores/sync'

interface SyncProviderProps {
  userId: string
  children: React.ReactNode
}

export function SyncProvider({ userId, children }: SyncProviderProps) {
  const { setOnline, refreshPendingCount } = useSyncStore()

  useEffect(() => {
    // Seed IndexedDB from Supabase on mount (idempotent via bulkPut)
    seedLocalDB(userId).catch(console.error)

    // Flush any queued offline operations
    if (navigator.onLine) flushQueue().then(refreshPendingCount)

    // Track online/offline status
    const handleOnline = () => {
      setOnline(true)
      flushQueue().then(refreshPendingCount)
    }
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Register sync queue listener
    const cleanup = startSyncListener()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      cleanup()
    }
  }, [userId, setOnline, refreshPendingCount])

  return <>{children}</>
}
