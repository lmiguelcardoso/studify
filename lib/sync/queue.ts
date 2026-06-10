import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'
import type { SyncQueueItem, SyncTable } from '@/types'
import { v4 as uuidv4 } from 'crypto'

export async function enqueue(
  table: SyncTable,
  operation: SyncQueueItem['operation'],
  payload: Record<string, unknown>
) {
  await db.syncQueue.add({
    id: crypto.randomUUID(),
    table,
    operation,
    payload,
    created_at: Date.now(),
    retries: 0,
  })
}

export async function flushQueue() {
  const items = await db.syncQueue.orderBy('created_at').toArray()
  if (items.length === 0) return

  const supabase = createClient()

  for (const item of items) {
    try {
      if (item.operation === 'INSERT' || item.operation === 'UPDATE') {
        await supabase.from(item.table).upsert(item.payload as never)
      } else if (item.operation === 'DELETE') {
        await supabase.from(item.table).delete().eq('id', item.payload.id)
      }
      await db.syncQueue.delete(item.id)
    } catch {
      await db.syncQueue.update(item.id, { retries: item.retries + 1 })
    }
  }
}

export function startSyncListener() {
  window.addEventListener('online', flushQueue)
  return () => window.removeEventListener('online', flushQueue)
}
