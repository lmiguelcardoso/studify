'use client'

import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import type { Topic } from '@/types'

interface TopicCardProps {
  topic: Topic
  subtopicCount: number
}

export function TopicCard({ topic, subtopicCount }: TopicCardProps) {
  const t = useTranslations('topics')

  return (
    <Card className="overflow-hidden rounded-md">
      <Link href={`/topics/${topic.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <CardContent className="flex min-h-32 gap-4 p-0">
          <div
            className="w-2 shrink-0"
            style={{ backgroundColor: topic.color ?? '#4f46e5' }}
            aria-hidden="true"
          />
          <div className="flex min-w-0 flex-1 items-start justify-between gap-4 p-5 pl-1">
            <div className="min-w-0 space-y-2">
              <h2 className="truncate text-lg font-semibold">{topic.name}</h2>
              {topic.description ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{topic.description}</p>
              ) : null}
              <p className="text-xs font-medium text-muted-foreground">
                {subtopicCount} {t('subtopics').toLowerCase()}
              </p>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
