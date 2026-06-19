'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit2, Plus, Trash2, FlipHorizontal, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useFlashcardsStore } from '@/stores/flashcards'
import { useTopicsStore } from '@/stores/topics'
import { useQuestionsStore } from '@/stores/questions'
import type { Flashcard, FlashcardPile } from '@/types'

interface FlashcardsClientProps {
  userId: string
}

const PILE_COLORS: Record<FlashcardPile, string> = {
  unknown: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  learning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  known: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

type ViewMode = 'list' | 'review'

export function FlashcardsClient({ userId }: FlashcardsClientProps) {
  const t = useTranslations('flashcards')
  const common = useTranslations('common')

  const { flashcards, isLoaded, load, loadByTopic, add, update, moveToPile, remove } = useFlashcardsStore()
  const { topics, isLoaded: topicsLoaded, load: loadTopics } = useTopicsStore()
  const { questions, isLoaded: questionsLoaded, load: loadQuestions } = useQuestionsStore()

  const [view, setView] = useState<ViewMode>('list')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formFront, setFormFront] = useState('')
  const [formBack, setFormBack] = useState('')
  const [formTopicId, setFormTopicId] = useState('')
  const [formPile, setFormPile] = useState<FlashcardPile>('unknown')

  useEffect(() => {
    loadTopics()
    load()
  }, [load, loadTopics])

  function changeTopic(topicId: string) {
    setSelectedTopicId(topicId)
    if (topicId) {
      loadByTopic(topicId)
    } else {
      load()
    }
  }

  const filteredCards = useMemo(() => {
    if (!selectedTopicId) return flashcards
    return flashcards.filter((card) => card.topic_id === selectedTopicId)
  }, [flashcards, selectedTopicId])

  const sortedCards = useMemo(() => {
    const pileOrder: Record<FlashcardPile, number> = { unknown: 0, learning: 1, known: 2 }
    return [...filteredCards].sort((a, b) => pileOrder[a.pile] - pileOrder[b.pile])
  }, [filteredCards])

  const reviewCards = useMemo(
    () => sortedCards.filter((card) => card.pile !== 'known'),
    [sortedCards]
  )

  const getTopicName = (topicId: string) => topics.find((t) => t.id === topicId)?.name ?? '-'
  const sortedTopics = useMemo(
    () => [...topics].sort((a, b) => a.name.localeCompare(b.name)),
    [topics]
  )

  function resetForm() {
    setFormFront('')
    setFormBack('')
    setFormTopicId('')
    setFormPile('unknown')
  }

  async function handleCreate() {
    if (!formFront.trim() || !formBack.trim()) return
    setError(null)
    const now = new Date().toISOString()
    const card: Flashcard = {
      id: crypto.randomUUID(),
      user_id: userId,
      topic_id: formTopicId || selectedTopicId || topics[0]?.id || '',
      question_id: null,
      front: formFront.trim(),
      back: formBack.trim(),
      pile: formPile,
      created_at: now,
      updated_at: now,
    }
    try {
      await add(card)
      resetForm()
      setIsCreating(false)
    } catch {
      setError(common('error'))
    }
  }

  function startEdit(card: Flashcard) {
    setEditingCardId(card.id)
    setFormFront(card.front)
    setFormBack(card.back)
    setFormTopicId(card.topic_id)
    setFormPile(card.pile)
  }

  function cancelEdit() {
    setEditingCardId(null)
    resetForm()
  }

  async function handleUpdate() {
    if (!editingCardId || !formFront.trim() || !formBack.trim()) return
    setError(null)
    try {
      await update(editingCardId, {
        front: formFront.trim(),
        back: formBack.trim(),
        topic_id: formTopicId,
        pile: formPile,
      })
      cancelEdit()
    } catch {
      setError(common('error'))
    }
  }

  async function handleDelete(id: string) {
    setError(null)
    if (!window.confirm(t('confirmDelete'))) return
    try {
      await remove(id)
    } catch {
      setError(common('error'))
    }
  }

  function startReview() {
    setReviewIndex(0)
    setIsFlipped(false)
    setView('review')
  }

  function exitReview() {
    setView('list')
    setReviewIndex(0)
    setIsFlipped(false)
  }

  async function handlePileSelect(pile: FlashcardPile) {
    if (reviewIndex >= reviewCards.length) return
    const card = reviewCards[reviewIndex]
    try {
      await moveToPile(card.id, pile)
      if (reviewIndex < reviewCards.length - 1) {
        setReviewIndex(reviewIndex + 1)
        setIsFlipped(false)
      } else {
        setReviewIndex(reviewIndex + 1)
      }
    } catch {
      setError(common('error'))
    }
  }

  function openConvert() {
    loadQuestions()
    setIsConverting(true)
  }

  async function handleConvert(questionId: string) {
    const question = questions.find((q) => q.id === questionId)
    if (!question) return
    setError(null)
    const now = new Date().toISOString()
    const card: Flashcard = {
      id: crypto.randomUUID(),
      user_id: userId,
      topic_id: question.topic_id,
      question_id: question.id,
      front: question.text,
      back: question.explanation ?? '',
      pile: 'unknown',
      created_at: now,
      updated_at: now,
    }
    try {
      await add(card)
      setIsConverting(false)
    } catch {
      setError(common('error'))
    }
  }

  // ── Shared form for create/edit ──

  function renderForm(isEdit: boolean) {
    return (
      <div className="space-y-4 rounded-md border bg-card p-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="flashcard-front">{t('front')}</Label>
          <textarea
            id="flashcard-front"
            value={formFront}
            onChange={(e) => setFormFront(e.target.value)}
            required
            rows={3}
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="flashcard-back">{t('back')}</Label>
          <textarea
            id="flashcard-back"
            value={formBack}
            onChange={(e) => setFormBack(e.target.value)}
            required
            rows={3}
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="flashcard-topic">{t('topic')}</Label>
          <select
            id="flashcard-topic"
            value={formTopicId}
            onChange={(e) => setFormTopicId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {sortedTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <div className="flex gap-2">
            {(['unknown', 'learning', 'known'] as FlashcardPile[]).map((pile) => (
              <button
                key={pile}
                type="button"
                onClick={() => setFormPile(pile)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  formPile === pile ? PILE_COLORS[pile] : 'border border-input bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {t(`pile.${pile}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={isEdit ? cancelEdit : () => setIsCreating(false)}>
            {common('cancel')}
          </Button>
          <Button type="button" onClick={isEdit ? handleUpdate : handleCreate} disabled={!formFront.trim() || !formBack.trim()}>
            {isEdit ? common('save') : common('create')}
          </Button>
        </div>
      </div>
    )
  }

  // ── Loading ──

  if (!isLoaded || !topicsLoaded) {
    return (
      <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{common('loading')}</p>
      </div>
    )
  }

  // ── Review View ──

  if (view === 'review') {
    const isComplete = reviewIndex >= reviewCards.length

    if (reviewCards.length === 0) {
      return (
        <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col items-center justify-center gap-4 p-6">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-lg font-medium">{t('reviewComplete')}</p>
          <Button onClick={exitReview}>{common('back')}</Button>
        </div>
      )
    }

    if (isComplete) {
      return (
        <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col items-center justify-center gap-4 p-6">
          <RotateCcw className="h-12 w-12 text-green-500" />
          <p className="text-lg font-medium">{t('reviewComplete')}</p>
          <p className="text-sm text-muted-foreground">
            {t('cardsReviewed')}: {reviewCards.length}
          </p>
          <Button onClick={exitReview}>{common('back')}</Button>
        </div>
      )
    }

    const card = reviewCards[reviewIndex]

    return (
      <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={exitReview}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {common('back')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('reviewProgress', { current: reviewIndex + 1, total: reviewCards.length })}
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg rounded-lg border bg-card p-8 shadow-sm">
            {!isFlipped ? (
              <div className="space-y-6">
                <p className="whitespace-pre-wrap text-lg">{card.front}</p>
                <Button className="w-full" onClick={() => setIsFlipped(true)}>
                  <FlipHorizontal className="h-4 w-4" aria-hidden="true" />
                  {t('flip')}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="whitespace-pre-wrap text-lg">{card.back}</p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handlePileSelect('unknown')}
                    className="w-full bg-amber-600 text-white hover:bg-amber-700"
                  >
                    {t('pile.unknown')}
                  </Button>
                  <Button
                    onClick={() => handlePileSelect('learning')}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {t('pile.learning')}
                  </Button>
                  <Button
                    onClick={() => handlePileSelect('known')}
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    {t('pile.known')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── List View ──

  const isEmpty = sortedCards.length === 0
  const hasNoTopicCards = isEmpty && !!selectedTopicId

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTopicId}
            onChange={(e) => changeTopic(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t('topic')}
          >
            <option value="">{t('allTopics')}</option>
            {sortedTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => { resetForm(); setFormTopicId(selectedTopicId || sortedTopics[0]?.id || ''); setIsCreating((v) => !v); }}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('newCard')}
        </Button>
        <Button type="button" variant="outline" onClick={startReview} disabled={sortedCards.length === 0}>
          <FlipHorizontal className="h-4 w-4" aria-hidden="true" />
          {t('startReview')}
        </Button>
        <Button type="button" variant="outline" onClick={openConvert} disabled={topics.length === 0}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('convertFromQuestion')}
        </Button>
      </div>

      {isCreating ? renderForm(false) : null}

      {editingCardId ? renderForm(true) : null}

      {isEmpty && !isCreating ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">{hasNoTopicCards ? t('noCardsForTopic') : t('noCards')}</p>
        </div>
      ) : null}

      {!isEmpty ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedCards.map((card) => (
            <div
              key={card.id}
              className="group relative flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="line-clamp-3 text-sm font-medium">{card.front}</p>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PILE_COLORS[card.pile]}`}>
                  {t(`pile.${card.pile}`)}
                </span>
                <span className="text-xs text-muted-foreground">{getTopicName(card.topic_id)}</span>
              </div>

              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => startEdit(card)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={common('edit')}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(card.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={common('delete')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Convert from Question dialog */}
      {isConverting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('convertFromQuestion')}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsConverting(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            {!questionsLoaded ? (
              <p className="text-sm text-muted-foreground">{common('loading')}</p>
            ) : questions.length === 0 ? (
              <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                {t('noCards')}
              </p>
            ) : (
              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                {questions
                  .filter((q) => !selectedTopicId || q.topic_id === selectedTopicId)
                  .map((question) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => handleConvert(question.id)}
                      className="flex flex-col gap-1 rounded-md border bg-card p-3 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <span className="line-clamp-2 font-medium">{question.text}</span>
                      <span className="text-xs text-muted-foreground">{getTopicName(question.topic_id)}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
