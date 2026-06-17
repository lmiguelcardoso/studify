'use client'

import { useEffect, useMemo } from 'react'
import { Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTopicsStore } from '@/stores/topics'

export function QuizTopicSelector() {
  const t = useTranslations('quiz')
  const topicsT = useTranslations('topics')
  const { topics, isLoaded, load } = useTopicsStore()

  useEffect(() => {
    load()
  }, [load])

  const sortedTopics = useMemo(() => [...topics].sort((a, b) => a.name.localeCompare(b.name)), [topics])

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('selectTopic')}</p>
      </div>

      {isLoaded && sortedTopics.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">{topicsT('noTopics')}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedTopics.map((topic) => (
          <Card key={topic.id} className="rounded-md">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: topic.color ?? '#4f46e5' }}
                    aria-hidden="true"
                  />
                  <h2 className="truncate font-semibold">{topic.name}</h2>
                </div>
                {topic.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{topic.description}</p>
                ) : null}
              </div>
              <Button asChild>
                <Link href={`/quiz/${topic.id}`}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  {t('start')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
