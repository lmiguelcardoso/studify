'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { DeleteTopicDialog } from '@/components/topics/DeleteTopicDialog'
import { FlashcardsPanel } from '@/components/flashcards/FlashcardsPanel'
import { TopicForm } from '@/components/topics/TopicForm'
import { TopicTree } from '@/components/topics/TopicTree'
import { QuestionsPanel } from '@/components/quiz/QuestionsPanel'
import { useTopicsStore } from '@/stores/topics'

interface TopicDetailClientProps {
  topicId: string
  userId: string
}

const tabs = ['subtopics', 'questions', 'flashcards', 'materials'] as const

export function TopicDetailClient({ topicId, userId }: TopicDetailClientProps) {
  const t = useTranslations('topics')
  const common = useTranslations('common')
  const router = useRouter()
  const { topics, isLoaded, load, add, update, remove } = useTopicsStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isCreatingSubtopic, setIsCreatingSubtopic] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('subtopics')

  useEffect(() => {
    load()
  }, [load])

  const topic = topics.find((candidate) => candidate.id === topicId)
  const parent = topic?.parent_id ? topics.find((candidate) => candidate.id === topic.parent_id) : null
  const subtopics = useMemo(
    () => topics.filter((candidate) => candidate.parent_id === topicId).sort((a, b) => a.name.localeCompare(b.name)),
    [topicId, topics]
  )

  async function handleCreateSubtopic(values: { name: string; description: string; color: string; parentId: string }) {
    const now = new Date().toISOString()
    await add({
      id: crypto.randomUUID(),
      user_id: userId,
      name: values.name,
      description: values.description || null,
      parent_id: values.parentId || topicId,
      color: values.color,
      created_at: now,
      updated_at: now,
    })
    setIsCreatingSubtopic(false)
  }

  async function handleUpdate(values: { name: string; description: string; color: string; parentId: string }) {
    await update(topicId, {
      name: values.name,
      description: values.description || null,
      parent_id: values.parentId || null,
      color: values.color,
    })
    setIsEditing(false)
  }

  async function handleDelete() {
    await remove(topicId)
    setIsDeleting(false)
    router.push('/topics')
  }

  if (!topic && isLoaded) {
    return (
      <div className="mx-auto w-full max-w-screen-xl p-6">
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">{common('noResults')}</p>
          <Button asChild variant="link" className="mt-3">
            <Link href="/topics">{common('back')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!topic) {
    return <div className="mx-auto w-full max-w-screen-xl p-6 text-sm text-muted-foreground">{common('loading')}</div>
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-6 p-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          {t('home')}
        </Link>
        <span>/</span>
        {parent ? (
          <>
            <Link href={`/topics/${parent.id}`} className="hover:text-foreground">
              {parent.name}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-foreground">{topic.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className="mt-1 h-8 w-2 rounded-full"
            style={{ backgroundColor: topic.color ?? '#4f46e5' }}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold">{topic.name}</h1>
            {topic.description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{topic.description}</p> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setIsEditing((value) => !value)}>
            <Edit2 className="h-4 w-4" aria-hidden="true" />
            {common('edit')}
          </Button>
          <Button type="button" variant="destructive" onClick={() => setIsDeleting(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {common('delete')}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <TopicForm topics={topics} userId={userId} topic={topic} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
      ) : null}

      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              activeTab === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {activeTab === 'subtopics' ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t('subtopics')}</h2>
            <Button type="button" variant="outline" onClick={() => setIsCreatingSubtopic((value) => !value)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('new')}
            </Button>
          </div>

          {isCreatingSubtopic ? (
            <TopicForm
              topics={topics}
              userId={userId}
              parentId={topicId}
              onSubmit={handleCreateSubtopic}
              onCancel={() => setIsCreatingSubtopic(false)}
            />
          ) : null}

          {subtopics.length > 0 ? (
            <TopicTree topics={topics} parentId={topicId} />
          ) : (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              {t('noTopics')}
            </div>
          )}
        </section>
      ) : activeTab === 'questions' ? (
        <QuestionsPanel topicId={topicId} userId={userId} />
      ) : activeTab === 'flashcards' ? (
        <FlashcardsPanel topicId={topicId} userId={userId} />
      ) : (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t('comingSoon')}
        </div>
      )}

      <DeleteTopicDialog
        topic={topic}
        isOpen={isDeleting}
        onCancel={() => setIsDeleting(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
