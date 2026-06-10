import Dexie, { type EntityTable } from 'dexie'
import type {
  Topic,
  Question,
  Flashcard,
  Material,
  QuizSession,
  QuizAnswer,
  FlashcardSession,
  SyncQueueItem,
} from '@/types'

class StudifyDB extends Dexie {
  topics!: EntityTable<Topic, 'id'>
  questions!: EntityTable<Question, 'id'>
  flashcards!: EntityTable<Flashcard, 'id'>
  materials!: EntityTable<Material, 'id'>
  quizSessions!: EntityTable<QuizSession, 'id'>
  quizAnswers!: EntityTable<QuizAnswer, 'id'>
  flashcardSessions!: EntityTable<FlashcardSession, 'id'>
  syncQueue!: EntityTable<SyncQueueItem, 'id'>

  constructor() {
    super('studify')

    this.version(1).stores({
      topics: 'id, user_id, parent_id, name, updated_at',
      questions: 'id, user_id, topic_id, type, updated_at',
      flashcards: 'id, user_id, topic_id, question_id, pile, updated_at',
      materials: 'id, user_id, topic_id, type, updated_at',
      quizSessions: 'id, user_id, topic_id, started_at',
      quizAnswers: 'id, session_id, question_id',
      flashcardSessions: 'id, user_id, topic_id, started_at',
      syncQueue: '++id, table, operation, created_at',
    })
  }
}

export const db = new StudifyDB()
