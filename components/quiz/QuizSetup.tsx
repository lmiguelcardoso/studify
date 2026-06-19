'use client'

import { useEffect, useMemo, useState } from 'react'
import { Brain } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { db } from '@/lib/db'
import type { Topic } from '@/types'

interface QuizSetupProps {
  userId: string
  onStart: (topicId: string) => void
}

export function QuizSetup({ onStart }: QuizSetupProps) {
  const t = useTranslations('quiz')
  const common = useTranslations('common')

  const [topics, setTopics] = useState<Topic[]>([])
  const [questionCounts, setQuestionCounts] = useState<Map<string, number>>(
    new Map(),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')

  useEffect(() => {
    let isMounted = true

    async function load() {
      const [allTopics, allQuestions] = await Promise.all([
        db.topics.toArray(),
        db.questions.toArray(),
      ])

      if (!isMounted) return

      const counts = new Map<string, number>()
      for (const question of allQuestions) {
        counts.set(
          question.topic_id,
          (counts.get(question.topic_id) ?? 0) + 1,
        )
      }

      setTopics(allTopics)
      setQuestionCounts(counts)
      setIsLoading(false)
    }

    load().catch(() => {
      if (isMounted) setIsLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const availableTopics = useMemo(
    () =>
      topics
        .filter((topic) => (questionCounts.get(topic.id) ?? 0) > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [topics, questionCounts],
  )

  const handleStart = () => {
    if (selectedTopicId) {
      onStart(selectedTopicId)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-start p-6 pt-12">
        <p className="text-sm text-muted-foreground">{common('loading')}</p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6 pt-12">
      <header>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('selectTopic')}
        </p>
      </header>

      {availableTopics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10">
            <Brain className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">{t('noTopicsWithQuestions')}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{t('selectATopic')}</option>
            {availableTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name} ({questionCounts.get(topic.id)})
              </option>
            ))}
          </select>

          <Button
            type="button"
            size="lg"
            disabled={!selectedTopicId}
            onClick={handleStart}
          >
            {t('start')}
          </Button>
        </div>
      )}
    </main>
  )
}
