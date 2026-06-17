import type { Flashcard, FlashcardSession, QuizSession, Topic } from '@/types'

export type AccuracyPoint = {
  date: string
  accuracy: number
}

export type PileDistribution = {
  unknown: number
  learning: number
  known: number
}

export type TopicAccuracy = {
  topicId: string
  topicName: string
  accuracy: number
  correctAnswers: number
  totalQuestions: number
  sessions: number
}

export function calcAvgAccuracy(sessions: QuizSession[]): number {
  const finished = sessions.filter(
    (session) => session.finished_at && session.total_questions > 0,
  )

  if (!finished.length) return 0

  const total = finished.reduce(
    (sum, session) => sum + session.correct_answers / session.total_questions,
    0,
  )

  return Math.round((total / finished.length) * 100)
}

export function calcStreak(
  sessions: (QuizSession | FlashcardSession)[],
  today = new Date(),
): number {
  const days = new Set(
    sessions
      .filter((session) => Boolean(session.started_at))
      .map((session) => session.started_at.slice(0, 10)),
  )

  const todayKey = toDateKey(today)
  let current = todayKey
  let streak = 0

  for (const day of [...days].sort().reverse()) {
    if (day > todayKey) continue

    if (day === current) {
      streak += 1
      current = prevDay(current)
      continue
    }

    if (streak === 0 && day === prevDay(current)) {
      streak += 1
      current = prevDay(day)
      continue
    }

    break
  }

  return streak
}

export function accuracyByDay(sessions: QuizSession[]): AccuracyPoint[] {
  const byDay: Record<string, { correct: number; total: number }> = {}

  for (const session of sessions) {
    if (!session.finished_at || session.total_questions <= 0) continue

    const day = session.started_at.slice(0, 10)
    byDay[day] ??= { correct: 0, total: 0 }
    byDay[day].correct += session.correct_answers
    byDay[day].total += session.total_questions
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, totals]) => ({
      date,
      accuracy: Math.round((totals.correct / totals.total) * 100),
    }))
}

export function pileDistribution(flashcards: Flashcard[]): PileDistribution {
  return {
    unknown: flashcards.filter((flashcard) => flashcard.pile === 'unknown')
      .length,
    learning: flashcards.filter((flashcard) => flashcard.pile === 'learning')
      .length,
    known: flashcards.filter((flashcard) => flashcard.pile === 'known').length,
  }
}

export function topicAccuracyBreakdown(
  sessions: QuizSession[],
  topics: Topic[],
): TopicAccuracy[] {
  const topicNames = new Map(topics.map((topic) => [topic.id, topic.name]))
  const byTopic = new Map<
    string,
    { correctAnswers: number; totalQuestions: number; sessions: number }
  >()

  for (const session of sessions) {
    if (!session.finished_at || session.total_questions <= 0) continue

    const totals = byTopic.get(session.topic_id) ?? {
      correctAnswers: 0,
      totalQuestions: 0,
      sessions: 0,
    }

    totals.correctAnswers += session.correct_answers
    totals.totalQuestions += session.total_questions
    totals.sessions += 1
    byTopic.set(session.topic_id, totals)
  }

  return Array.from(byTopic.entries())
    .map(([topicId, totals]) => ({
      topicId,
      topicName: topicNames.get(topicId) ?? topicId,
      accuracy: Math.round(
        (totals.correctAnswers / totals.totalQuestions) * 100,
      ),
      ...totals,
    }))
    .sort(
      (a, b) =>
        b.accuracy - a.accuracy || a.topicName.localeCompare(b.topicName),
    )
}

function prevDay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return toDateKey(date)
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}
