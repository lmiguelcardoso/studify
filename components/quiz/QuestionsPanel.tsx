'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DeleteQuestionDialog } from '@/components/quiz/DeleteQuestionDialog'
import { QuestionCard } from '@/components/quiz/QuestionCard'
import { QuestionForm } from '@/components/quiz/QuestionForm'
import { useFlashcardsStore } from '@/stores/flashcards'
import { useQuestionsStore } from '@/stores/questions'
import type { Flashcard, Question, QuestionOption, QuestionType } from '@/types'

interface QuestionsPanelProps {
  topicId: string
  userId: string
}

interface QuestionFormValues {
  type: QuestionType
  text: string
  explanation: string
  options: QuestionOption[]
}

export function QuestionsPanel({ topicId, userId }: QuestionsPanelProps) {
  const t = useTranslations('quiz')
  const { questions, isLoaded, loadByTopic, add, update, remove } = useQuestionsStore()
  const {
    flashcards,
    loadByTopic: loadFlashcardsByTopic,
    add: addFlashcard,
  } = useFlashcardsStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null)
  const [conversionMessage, setConversionMessage] = useState<string | null>(null)

  useEffect(() => {
    loadByTopic(topicId)
    loadFlashcardsByTopic(topicId)
  }, [loadByTopic, loadFlashcardsByTopic, topicId])

  const topicQuestions = useMemo(
    () =>
      questions
        .filter((question) => question.topic_id === topicId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [questions, topicId]
  )
  const editingQuestion = topicQuestions.find((question) => question.id === editingQuestionId)
  const deletingQuestion = topicQuestions.find((question) => question.id === deletingQuestionId)

  async function handleCreate(values: QuestionFormValues) {
    const now = new Date().toISOString()
    await add({
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
    setIsCreating(false)
  }

  async function handleUpdate(values: QuestionFormValues) {
    if (!editingQuestion) return

    await update(editingQuestion.id, {
      type: values.type,
      text: values.text,
      explanation: values.explanation || null,
      options: values.options,
    })
    setEditingQuestionId(null)
  }

  async function handleDelete() {
    if (!deletingQuestion) return

    await remove(deletingQuestion.id)
    setDeletingQuestionId(null)
  }

  async function handleConvertToFlashcard(question: Question) {
    if (flashcards.some((flashcard) => flashcard.question_id === question.id)) {
      setConversionMessage(t('alreadyConverted'))
      return
    }

    const correctOption = question.options.find((option) => option.is_correct)
    const back = question.explanation
      ? `${correctOption?.text ?? ''}\n\n${question.explanation}`
      : correctOption?.text ?? ''
    const now = new Date().toISOString()
    const flashcard: Flashcard = {
      id: crypto.randomUUID(),
      user_id: userId,
      topic_id: question.topic_id,
      question_id: question.id,
      front: question.text,
      back,
      pile: 'unknown',
      created_at: now,
      updated_at: now,
    }

    await addFlashcard(flashcard)
    setConversionMessage(t('converted'))
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button type="button" variant="outline" onClick={() => setIsCreating((value) => !value)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('newQuestion')}
        </Button>
      </div>

      {isCreating ? <QuestionForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} /> : null}

      {conversionMessage ? (
        <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
          {conversionMessage}
        </div>
      ) : null}

      {editingQuestion ? (
        <QuestionForm
          question={editingQuestion}
          onSubmit={handleUpdate}
          onCancel={() => setEditingQuestionId(null)}
        />
      ) : null}

      {isLoaded && topicQuestions.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t('noQuestions')}
        </div>
      ) : null}

      <div className="space-y-3">
        {topicQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            isConvertedToFlashcard={flashcards.some((flashcard) => flashcard.question_id === question.id)}
            onEdit={() => setEditingQuestionId(question.id)}
            onDelete={() => setDeletingQuestionId(question.id)}
            onConvertToFlashcard={() => handleConvertToFlashcard(question)}
          />
        ))}
      </div>

      {deletingQuestion ? (
        <DeleteQuestionDialog
          question={deletingQuestion}
          isOpen={!!deletingQuestion}
          onCancel={() => setDeletingQuestionId(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </section>
  )
}
