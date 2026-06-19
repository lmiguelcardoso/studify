'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { QuestionCard } from '@/components/questions/QuestionCard'
import { QuestionForm } from '@/components/questions/QuestionForm'
import { DeleteQuestionDialog } from '@/components/questions/DeleteQuestionDialog'
import { DeleteTopicDialog } from '@/components/topics/DeleteTopicDialog'
import { TopicForm } from '@/components/topics/TopicForm'
import { TopicTree } from '@/components/topics/TopicTree'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { MaterialForm } from '@/components/materials/MaterialForm'
import { DeleteMaterialDialog } from '@/components/materials/DeleteMaterialDialog'
import { useTopicsStore } from '@/stores/topics'
import { useQuestionsStore } from '@/stores/questions'
import { useMaterialsStore } from '@/stores/materials'
import type { Material, Question } from '@/types'

interface TopicDetailClientProps {
  topicId: string
  userId: string
}

const tabs = ['subtopics', 'questions', 'flashcards', 'materials'] as const

export function TopicDetailClient({ topicId, userId }: TopicDetailClientProps) {
  const t = useTranslations('topics')
  const quiz = useTranslations('quiz')
  const mat = useTranslations('materials')
  const common = useTranslations('common')
  const router = useRouter()
  const { topics, isLoaded, load, add, update, remove } = useTopicsStore()

  const {
    questions,
    isLoaded: questionsLoaded,
    loadByTopic,
    add: addQuestion,
    update: updateQuestion,
    remove: removeQuestion,
  } = useQuestionsStore()

  const {
    materials,
    isLoaded: materialsLoaded,
    loadByTopic: loadMaterialsByTopic,
    add: addMaterial,
    update: updateMaterial,
    remove: removeMaterial,
  } = useMaterialsStore()

  const [isEditing, setIsEditing] = useState(false)
  const [isCreatingSubtopic, setIsCreatingSubtopic] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('subtopics')
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null)
  const [isCreatingMaterial, setIsCreatingMaterial] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null)

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (activeTab === 'questions' && !questionsLoaded) {
      loadByTopic(topicId)
    }
  }, [activeTab, topicId, questionsLoaded, loadByTopic])

  useEffect(() => {
    if (activeTab === 'materials' && !materialsLoaded) {
      loadMaterialsByTopic(topicId)
    }
  }, [activeTab, topicId, materialsLoaded, loadMaterialsByTopic])

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

  async function handleCreateQuestion(values: { text: string; type: Question['type']; options: Question['options']; explanation: string }) {
    const now = new Date().toISOString()
    await addQuestion({
      id: crypto.randomUUID(),
      user_id: userId,
      topic_id: topicId,
      type: values.type,
      text: values.text,
      explanation: values.explanation || null,
      options: values.options,
      created_at: now,
      updated_at: now,
    })
    setIsCreatingQuestion(false)
  }

  async function handleUpdateQuestion(values: { text: string; type: Question['type']; options: Question['options']; explanation: string }) {
    if (!editingQuestion) return
    await updateQuestion(editingQuestion.id, {
      type: values.type,
      text: values.text,
      explanation: values.explanation || null,
      options: values.options,
    })
    setEditingQuestion(null)
  }

  async function handleDeleteQuestion() {
    if (!deletingQuestion) return
    await removeQuestion(deletingQuestion.id)
    setDeletingQuestion(null)
  }

  const topicQuestions = useMemo(
    () => questions.filter((candidate) => candidate.topic_id === topicId).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [questions, topicId]
  )

  const topicMaterials = useMemo(
    () => materials.filter((candidate) => candidate.topic_id === topicId).sort((a, b) => a.title.localeCompare(b.title)),
    [materials, topicId]
  )

  async function handleDeleteMaterial() {
    if (!deletingMaterial) return
    await removeMaterial(deletingMaterial.id)
    setDeletingMaterial(null)
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
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t('questions')}</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreatingQuestion((value) => !value)
                setEditingQuestion(null)
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {quiz('newQuestion')}
            </Button>
          </div>

          {isCreatingQuestion ? (
            <QuestionForm onSubmit={handleCreateQuestion} onCancel={() => setIsCreatingQuestion(false)} />
          ) : null}

          {editingQuestion ? (
            <QuestionForm question={editingQuestion} onSubmit={handleUpdateQuestion} onCancel={() => setEditingQuestion(null)} />
          ) : null}

          {!questionsLoaded ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              {common('loading')}
            </div>
          ) : topicQuestions.length === 0 && !isCreatingQuestion ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              {quiz('noQuestions')}
            </div>
          ) : (
            <div className="space-y-3">
              {topicQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onEdit={setEditingQuestion}
                  onDelete={setDeletingQuestion}
                />
              ))}
            </div>
          )}
        </section>
      ) : activeTab === 'materials' ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t('materials')}</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreatingMaterial((value) => !value)
                setEditingMaterial(null)
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {mat('newMaterial')}
            </Button>
          </div>

          {isCreatingMaterial ? (
            <MaterialForm
              userId={userId}
              topics={topics}
              topicId={topicId}
              onSubmit={() => setIsCreatingMaterial(false)}
              onCancel={() => setIsCreatingMaterial(false)}
            />
          ) : null}

          {editingMaterial ? (
            <MaterialForm
              userId={userId}
              topics={topics}
              material={editingMaterial}
              topicId={topicId}
              onSubmit={() => setEditingMaterial(null)}
              onCancel={() => setEditingMaterial(null)}
            />
          ) : null}

          {!materialsLoaded ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              {common('loading')}
            </div>
          ) : topicMaterials.length === 0 && !isCreatingMaterial ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              {mat('noMaterials')}
            </div>
          ) : (
            <div className="space-y-3">
              {topicMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onEdit={setEditingMaterial}
                  onDelete={setDeletingMaterial}
                />
              ))}
            </div>
          )}
        </section>
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

      <DeleteQuestionDialog
        question={deletingQuestion!}
        isOpen={deletingQuestion !== null}
        onCancel={() => setDeletingQuestion(null)}
        onConfirm={handleDeleteQuestion}
      />

      <DeleteMaterialDialog
        material={deletingMaterial!}
        isOpen={deletingMaterial !== null}
        onCancel={() => setDeletingMaterial(null)}
        onConfirm={handleDeleteMaterial}
      />
    </div>
  )
}
