'use client'

import { useEffect } from 'react'
import { seedLocalDB } from '@/lib/db/seed'
import { flushQueue } from '@/lib/sync/queue'
import { useSyncStore } from '@/stores/sync'

interface SyncProviderProps {
  userId: string
  children: React.ReactNode
}

export function SyncProvider({ userId, children }: SyncProviderProps) {
  const { setOnline, refreshPendingCount } = useSyncStore()

  useEffect(() => {
    async function registerServiceWorker() {
      if (!('serviceWorker' in navigator)) return
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
    }

    async function primeOfflineState() {
      await registerServiceWorker()
      await seedLocalDB(userId)

      if (navigator.onLine) {
        await flushQueue()
      }

      await refreshPendingCount()
    }

    const handleOnline = () => {
      setOnline(true)
      flushQueue().finally(refreshPendingCount)
    }
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setOnline(navigator.onLine)
    primeOfflineState().catch(console.error)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshPendingCount, setOnline, userId])

  return children
}
