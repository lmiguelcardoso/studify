'use client'

import type { Question } from '@/types'

interface QuestionSlideProps {
  question: Question
  selectedOptionId: string | null
  onSelect: (optionId: string) => void
}

export function QuestionSlide({ question, selectedOptionId, onSelect }: QuestionSlideProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold leading-relaxed">{question.text}</h2>
      <div className="grid gap-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`rounded-md border p-4 text-left text-sm font-medium transition-colors ${
              selectedOptionId === option.id ? 'border-primary bg-primary/10' : 'bg-card hover:bg-muted'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  )
}
