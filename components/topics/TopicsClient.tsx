'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { TopicCard } from '@/components/topics/TopicCard'
import { TopicForm } from '@/components/topics/TopicForm'
import { useTopicsStore } from '@/stores/topics'
import type { Topic } from '@/types'

interface TopicsClientProps {
  userId: string
}

export function TopicsClient({ userId }: TopicsClientProps) {
  const t = useTranslations('topics')
  const { topics, isLoaded, load, add } = useTopicsStore()
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    load()
  }, [load])

  const rootTopics = useMemo(
    () => topics.filter((topic) => topic.parent_id === null).sort((a, b) => a.name.localeCompare(b.name)),
    [topics]
  )

  async function handleCreate(values: { name: string; description: string; color: string; parentId: string }) {
    const now = new Date().toISOString()
    const topic: Topic = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: values.name,
      description: values.description || null,
      parent_id: values.parentId || null,
      color: values.color,
      created_at: now,
      updated_at: now,
    }

    await add(topic)
    setIsCreating(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('descriptionText')}</p>
        </div>
        <Button type="button" onClick={() => setIsCreating((value) => !value)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('new')}
        </Button>
      </div>

      {isCreating ? (
        <TopicForm topics={topics} userId={userId} onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
      ) : null}

      {isLoaded && rootTopics.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">{t('noTopics')}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rootTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            subtopicCount={topics.filter((candidate) => candidate.parent_id === topic.id).length}
          />
        ))}
      </div>
    </div>
  )
}
