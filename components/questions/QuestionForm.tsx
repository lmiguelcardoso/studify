'use client'

import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Plus, Save, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Question, QuestionOption, QuestionType } from '@/types'

interface QuestionFormValues {
  text: string
  type: QuestionType
  options: QuestionOption[]
  explanation: string
}

interface QuestionFormProps {
  question?: Question
  onSubmit: (values: QuestionFormValues) => Promise<void>
  onCancel: () => void
}

function createOption(text = '', isCorrect = false): QuestionOption {
  return { id: crypto.randomUUID(), text, is_correct: isCorrect }
}

export function QuestionForm({ question, onSubmit, onCancel }: QuestionFormProps) {
  const t = useTranslations('quiz')
  const common = useTranslations('common')
  const [text, setText] = useState(question?.text ?? '')
  const [type, setType] = useState<QuestionType>(question?.type ?? 'multiple_choice')
  const [options, setOptions] = useState<QuestionOption[]>(() => {
    if (question) return question.options
    return [
      createOption('', true),
      createOption(''),
    ]
  })
  const [explanation, setExplanation] = useState(question?.explanation ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const correctCount = useMemo(() => options.filter((o) => o.is_correct).length, [options])

  function handleTypeChange(newType: QuestionType) {
    setType(newType)
    if (newType === 'true_false') {
      setOptions([
        createOption('True', true),
        createOption('False', false),
      ])
    } else if (newType === 'multiple_choice' && type !== newType) {
      setOptions([
        createOption('', true),
        createOption(''),
      ])
    }
  }

  function handleOptionText(index: number, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, text: value } : opt)))
  }

  function handleCorrectChange(index: number) {
    setOptions((prev) => prev.map((opt, i) => ({ ...opt, is_correct: i === index })))
  }

  function addOption() {
    setOptions((prev) => [...prev, createOption()])
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText) return
    if (correctCount !== 1) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        text: trimmedText,
        type,
        options: type === 'true_false'
          ? options.map((opt) => ({
              ...opt,
              text: opt.id === options.find((o) => o.is_correct)?.id ? 'True' : 'False',
            }))
          : options,
        explanation: explanation.trim(),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-card p-4">
      <div className="grid gap-2">
        <Label htmlFor="question-text">{t('questionText')}</Label>
        <textarea
          id="question-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          required
          maxLength={500}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="question-type">{t('type.multiple_choice')}</Label>
        <select
          id="question-type"
          value={type}
          onChange={(event) => handleTypeChange(event.target.value as QuestionType)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="multiple_choice">{t('type.multiple_choice')}</option>
          <option value="true_false">{t('type.true_false')}</option>
        </select>
      </div>

      {type === 'true_false' ? (
        <div className="grid gap-2">
          <Label>{t('correctAnswer')}</Label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="true-false"
                checked={options[0]?.is_correct ?? true}
                onChange={() => handleCorrectChange(0)}
                className="h-4 w-4 accent-primary"
              />
              {t('true')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="true-false"
                checked={options[1]?.is_correct ?? false}
                onChange={() => handleCorrectChange(1)}
                className="h-4 w-4 accent-primary"
              />
              {t('false')}
            </label>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label>{t('options')}</Label>
            <Button type="button" size="sm" variant="outline" onClick={addOption} disabled={options.length >= 6}>
              <Plus className="h-3 w-3" aria-hidden="true" />
              {t('addOption')}
            </Button>
          </div>
          {options.map((option, index) => (
            <div key={option.id} className="flex items-start gap-2">
              <input
                type="radio"
                name="correct-option"
                checked={option.is_correct}
                onChange={() => handleCorrectChange(index)}
                className="mt-3 h-4 w-4 shrink-0 accent-primary"
                aria-label={t('correctAnswer')}
                required
              />
              <div className="flex-1">
                <Input
                  value={option.text}
                  onChange={(event) => handleOptionText(index, event.target.value)}
                  placeholder={`${t('options')} ${index + 1}`}
                  required
                  maxLength={200}
                />
              </div>
              {options.length > 2 ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeOption(index)}
                  aria-label={common('cancel')}
                  className="mt-0.5"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="question-explanation">{t('explanation')}</Label>
        <textarea
          id="question-explanation"
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          rows={2}
          maxLength={500}
          className="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {common('cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting || !text.trim() || correctCount !== 1}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {question ? common('save') : common('create')}
        </Button>
      </div>
    </form>
  )
}
