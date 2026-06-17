'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { QuestionOption } from '@/types'

interface OptionInputProps {
  option: QuestionOption
  index: number
  canRemove: boolean
  onChange: (id: string, text: string) => void
  onCorrectChange: (id: string) => void
  onRemove: (id: string) => void
}

export function OptionInput({
  option,
  index,
  canRemove,
  onChange,
  onCorrectChange,
  onRemove,
}: OptionInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        name="correct-option"
        checked={option.is_correct}
        onChange={() => onCorrectChange(option.id)}
        className="h-4 w-4"
        aria-label={`Correct option ${index + 1}`}
      />
      <Input
        value={option.text}
        onChange={(event) => onChange(option.id, event.target.value)}
        maxLength={160}
        required
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => onRemove(option.id)}
        disabled={!canRemove}
        aria-label={`Remove option ${index + 1}`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
