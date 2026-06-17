'use client'

import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Check, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEFAULT_TOPIC_COLOR, TOPIC_COLORS } from '@/components/topics/topic-colors'
import { cn } from '@/lib/utils'
import type { Topic } from '@/types'

interface TopicFormValues {
  name: string
  description: string
  color: string
  parentId: string
}

interface TopicFormProps {
  topics: Topic[]
  userId: string
  topic?: Topic
  parentId?: string | null
  onSubmit: (values: TopicFormValues) => Promise<void>
  onCancel?: () => void
}

export function TopicForm({ topics, userId, topic, parentId, onSubmit, onCancel }: TopicFormProps) {
  const t = useTranslations('topics')
  const common = useTranslations('common')
  const [name, setName] = useState(topic?.name ?? '')
  const [description, setDescription] = useState(topic?.description ?? '')
  const [color, setColor] = useState(topic?.color ?? DEFAULT_TOPIC_COLOR)
  const [selectedParentId, setSelectedParentId] = useState(topic?.parent_id ?? parentId ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const rootTopics = useMemo(
    () =>
      topics
        .filter((candidate) => candidate.parent_id === null && candidate.id !== topic?.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [topic?.id, topics]
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
        color,
        parentId: selectedParentId,
      })

      if (!topic) {
        setName('')
        setDescription('')
        setColor(DEFAULT_TOPIC_COLOR)
        setSelectedParentId(parentId ?? '')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-card p-4">
      <input type="hidden" value={userId} readOnly />
      <div className="grid gap-2">
        <Label htmlFor="topic-name">{t('name')}</Label>
        <Input
          id="topic-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={80}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="topic-description">{t('description')}</Label>
        <textarea
          id="topic-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          maxLength={240}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="topic-parent">{t('parent')}</Label>
        <select
          id="topic-parent"
          value={selectedParentId}
          onChange={(event) => setSelectedParentId(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">{t('noParent')}</option>
          {rootTopics.map((rootTopic) => (
            <option key={rootTopic.id} value={rootTopic.id}>
              {rootTopic.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label>{t('color')}</Label>
        <div className="flex flex-wrap gap-2">
          {TOPIC_COLORS.map((topicColor) => (
            <button
              key={topicColor}
              type="button"
              aria-label={topicColor}
              onClick={() => setColor(topicColor)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border-2 border-transparent',
                color === topicColor && 'border-foreground'
              )}
              style={{ backgroundColor: topicColor }}
            >
              {color === topicColor ? <Check className="h-4 w-4 text-white" aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {common('cancel')}
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {topic ? common('save') : common('create')}
        </Button>
      </div>
    </form>
  )
}
