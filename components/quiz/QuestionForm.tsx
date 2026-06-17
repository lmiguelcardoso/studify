'use client'

import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Plus, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OptionInput } from '@/components/quiz/OptionInput'
import type { Question, QuestionOption, QuestionType } from '@/types'

interface QuestionFormValues {
  type: QuestionType
  text: string
  explanation: string
  options: QuestionOption[]
}

interface QuestionFormProps {
  question?: Question
  onSubmit: (values: QuestionFormValues) => Promise<void>
  onCancel?: () => void
}

function createEmptyOption(): QuestionOption {
  return {
    id: crypto.randomUUID(),
    text: '',
    is_correct: false,
  }
}

export function QuestionForm({ question, onSubmit, onCancel }: QuestionFormProps) {
  const t = useTranslations('quiz')
  const common = useTranslations('common')
  const [type, setType] = useState<QuestionType>(question?.type ?? 'multiple_choice')
  const [text, setText] = useState(question?.text ?? '')
  const [explanation, setExplanation] = useState(question?.explanation ?? '')
  const [options, setOptions] = useState<QuestionOption[]>(
    question?.type === 'multiple_choice' && question.options.length >= 2
      ? question.options
      : [
          { ...createEmptyOption(), is_correct: true },
          createEmptyOption(),
        ]
  )
  const [trueFalseCorrect, setTrueFalseCorrect] = useState(
    question?.type === 'true_false'
      ? question.options.find((option) => option.is_correct)?.id ?? 'true'
      : 'true'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedOptions = useMemo<QuestionOption[]>(() => {
    if (type === 'true_false') {
      return [
        { id: 'true', text: t('true'), is_correct: trueFalseCorrect === 'true' },
        { id: 'false', text: t('false'), is_correct: trueFalseCorrect === 'false' },
      ]
    }

    return options.map((option) => ({ ...option, text: option.text.trim() }))
  }, [options, t, trueFalseCorrect, type])

  const hasValidOptions =
    type === 'true_false' ||
    (normalizedOptions.length >= 2 &&
      normalizedOptions.length <= 6 &&
      normalizedOptions.every((option) => option.text.length > 0) &&
      normalizedOptions.filter((option) => option.is_correct).length === 1)

  function handleTypeChange(nextType: QuestionType) {
    setType(nextType)
    if (nextType === 'multiple_choice' && options.length < 2) {
      setOptions([{ ...createEmptyOption(), is_correct: true }, createEmptyOption()])
    }
  }

  function handleOptionTextChange(id: string, nextText: string) {
    setOptions((current) =>
      current.map((option) => (option.id === id ? { ...option, text: nextText } : option))
    )
  }

  function handleCorrectChange(id: string) {
    setOptions((current) => current.map((option) => ({ ...option, is_correct: option.id === id })))
  }

  function handleRemoveOption(id: string) {
    setOptions((current) => current.filter((option) => option.id !== id))
  }

  function handleAddOption() {
    setOptions((current) => [...current, createEmptyOption()])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText || !hasValidOptions) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        type,
        text: trimmedText,
        explanation: explanation.trim(),
        options: normalizedOptions,
      })

      if (!question) {
        setText('')
        setExplanation('')
        setType('multiple_choice')
        setOptions([{ ...createEmptyOption(), is_correct: true }, createEmptyOption()])
        setTrueFalseCorrect('true')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-card p-4">
      <div className="grid gap-2">
        <Label htmlFor="question-type">{t('questionType')}</Label>
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

      <div className="grid gap-2">
        <Label htmlFor="question-text">{t('questionText')}</Label>
        <textarea
          id="question-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          required
          maxLength={480}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="grid gap-3">
        <Label>{t('options')}</Label>
        {type === 'multiple_choice' ? (
          <>
            <div className="space-y-2">
              {options.map((option, index) => (
                <OptionInput
                  key={option.id}
                  option={option}
                  index={index}
                  canRemove={options.length > 2}
                  onChange={handleOptionTextChange}
                  onCorrectChange={handleCorrectChange}
                  onRemove={handleRemoveOption}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddOption}
              disabled={options.length >= 6}
              className="w-fit"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('addOption')}
            </Button>
          </>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {(['true', 'false'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTrueFalseCorrect(value)}
                className={`rounded-md border p-3 text-left text-sm font-medium ${
                  trueFalseCorrect === value ? 'border-primary bg-primary/10' : 'bg-background'
                }`}
              >
                <Input
                  type="radio"
                  checked={trueFalseCorrect === value}
                  readOnly
                  className="mr-2 inline h-4 w-4 align-middle"
                />
                {t(value)}
              </button>
            ))}
          </div>
        )}
        {!hasValidOptions ? <p className="text-xs text-destructive">{t('validation')}</p> : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="question-explanation">{t('explanation')}</Label>
        <textarea
          id="question-explanation"
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          rows={3}
          maxLength={480}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {common('cancel')}
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting || !text.trim() || !hasValidOptions}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {question ? common('save') : common('create')}
        </Button>
      </div>
    </form>
  )
}
