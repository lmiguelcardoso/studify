export type Locale = 'pt-BR' | 'en'

// Auth
export interface User {
  id: string
  email: string
  created_at: string
}

// Topics
export interface Topic {
  id: string
  user_id: string
  name: string
  description: string | null
  parent_id: string | null
  color: string | null
  created_at: string
  updated_at: string
}

// Questions
export type QuestionType = 'multiple_choice' | 'true_false'

export interface QuestionOption {
  id: string
  text: string
  is_correct: boolean
}

export interface Question {
  id: string
  user_id: string
  topic_id: string
  type: QuestionType
  text: string
  explanation: string | null
  options: QuestionOption[]
  created_at: string
  updated_at: string
}

// Flashcards
export type FlashcardPile = 'unknown' | 'learning' | 'known'

export interface Flashcard {
  id: string
  user_id: string
  topic_id: string
  question_id: string | null // if converted from a quiz question
  front: string
  back: string
  pile: FlashcardPile
  created_at: string
  updated_at: string
}

// Materials
export type MaterialType = 'pdf' | 'video_link' | 'video_upload'

export interface Material {
  id: string
  user_id: string
  topic_id: string
  type: MaterialType
  title: string
  url: string | null       // for video links and uploaded files (storage url)
  file_path: string | null // supabase storage path
  created_at: string
  updated_at: string
}

// Quiz Sessions
export interface QuizSession {
  id: string
  user_id: string
  topic_id: string
  total_questions: number
  correct_answers: number
  started_at: string
  finished_at: string | null
}

export interface QuizAnswer {
  id: string
  session_id: string
  question_id: string
  selected_option_id: string | null
  is_correct: boolean
  answered_at: string
}

// Flashcard Sessions
export interface FlashcardSession {
  id: string
  user_id: string
  topic_id: string
  cards_reviewed: number
  started_at: string
  finished_at: string | null
}

// Sync queue (for offline)
export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE'
export type SyncTable = 'topics' | 'questions' | 'flashcards' | 'materials' | 'quiz_sessions' | 'quiz_answers' | 'flashcard_sessions'

export interface SyncQueueItem {
  id: string
  table: SyncTable
  operation: SyncOperation
  payload: Record<string, unknown>
  created_at: number // timestamp
  retries: number
}
