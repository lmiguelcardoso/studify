'use client'

import { ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Topic } from '@/types'

interface TopicTreeProps {
  topics: Topic[]
  parentId: string | null
  depth?: number
}

export function TopicTree({ topics, parentId, depth = 0 }: TopicTreeProps) {
  const children = topics
    .filter((topic) => topic.parent_id === parentId)
    .sort((a, b) => a.name.localeCompare(b.name))

  if (children.length === 0 || depth > 1) return null

  return (
    <ul className="space-y-2">
      {children.map((topic) => (
        <li key={topic.id}>
          <Link
            href={`/topics/${topic.id}`}
            className="flex items-center gap-3 rounded-md border bg-card p-3 text-sm font-medium hover:bg-muted"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: topic.color ?? '#4f46e5' }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate">{topic.name}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Link>
          {depth === 0 ? (
            <div className="ml-6 mt-2">
              <TopicTree topics={topics} parentId={topic.id} depth={depth + 1} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
