'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { EntityTable } from 'dexie'
import { useTranslations } from 'next-intl'
import { AccuracyChart } from '@/components/stats/AccuracyChart'
import { PileDistributionChart } from '@/components/stats/PileDistributionChart'
import { StatCard } from '@/components/stats/StatCard'
import { StreakCounter } from '@/components/stats/StreakCounter'
import { TopicBreakdown } from '@/components/stats/TopicBreakdown'
import { db } from '@/lib/db'
import {
  accuracyByDay,
  calcAvgAccuracy,
  calcStreak,
  pileDistribution,
  topicAccuracyBreakdown,
} from '@/lib/stats'
import type { Flashcard, FlashcardSession, QuizSession, Topic } from '@/types'

type StatsData = {
  quizSessions: QuizSession[]
  flashcardSessions: FlashcardSession[]
  flashcards: Flashcard[]
  topics: Topic[]
}

const emptyStatsData: StatsData = {
  quizSessions: [],
  flashcardSessions: [],
  flashcards: [],
  topics: [],
}

export default function StatsPage() {
  const t = useTranslations('stats')
  const [data, setData] = useState<StatsData>(emptyStatsData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadStats() {
      const userId = getStoredUserId()
      const [quizSessions, flashcardSessions, flashcards, topics] =
        await Promise.all([
          readUserRows(db.quizSessions, userId),
          readUserRows(db.flashcardSessions, userId),
          readUserRows(db.flashcards, userId),
          readUserRows(db.topics, userId),
        ])

      if (!isMounted) return

      setData({ quizSessions, flashcardSessions, flashcards, topics })
      setIsLoading(false)
    }

    loadStats().catch(() => {
      if (!isMounted) return
      setData(emptyStatsData)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const finishedQuizSessions = data.quizSessions.filter(
      (session) => session.finished_at,
    )

    return {
      totalQuizzes: finishedQuizSessions.length,
      totalFlashcardSessions: data.flashcardSessions.length,
      avgAccuracy: calcAvgAccuracy(data.quizSessions),
      streak: calcStreak([...data.quizSessions, ...data.flashcardSessions]),
      accuracyData: accuracyByDay(data.quizSessions),
      pileData: pileDistribution(data.flashcards),
      topics: topicAccuracyBreakdown(data.quizSessions, data.topics),
    }
  }, [data])

  const hasSessions =
    data.quizSessions.length > 0 || data.flashcardSessions.length > 0

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-normal">
            {t('title')}
          </h1>
        </header>

        {isLoading ? (
          <section className="rounded-lg border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm">
            {t('loading')}
          </section>
        ) : !hasSessions ? (
          <section className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              {t('emptyTitle')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              {t('emptyDescription')}
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label={t('totalQuizzes')}
                value={stats.totalQuizzes}
              />
              <StatCard
                label={t('totalFlashcards')}
                value={stats.totalFlashcardSessions}
              />
              <StatCard
                label={t('avgAccuracy')}
                value={`${stats.avgAccuracy}%`}
              />
              <StreakCounter
                days={stats.streak}
                label={t('studyStreak')}
                dayLabel={t('days')}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <ChartPanel title={t('accuracyOverTime')}>
                <AccuracyChart data={stats.accuracyData} />
              </ChartPanel>
              <ChartPanel title={t('cardsByPile')}>
                <PileDistributionChart
                  distribution={stats.pileData}
                  labels={{
                    unknown: t('pileUnknown'),
                    learning: t('pileLearning'),
                    known: t('pileKnown'),
                  }}
                />
              </ChartPanel>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-zinc-950">
                {t('topicBreakdown')}
              </h2>
              {stats.topics.length > 0 ? (
                <TopicBreakdown
                  rows={stats.topics}
                  labels={{
                    topic: t('topic'),
                    accuracy: t('avgAccuracy'),
                    sessions: t('sessions'),
                  }}
                />
              ) : (
                <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-500 shadow-sm">
                  {t('noTopicData')}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function ChartPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-950">{title}</h2>
      <div className="mt-4 h-[220px]">{children}</div>
    </section>
  )
}

async function readUserRows<T extends { id: string; user_id: string }>(
  table: EntityTable<T, 'id'>,
  userId: string | null,
): Promise<T[]> {
  if (!userId) return table.toArray()
  return table.where('user_id').equals(userId).toArray()
}

function getStoredUserId(): string | null {
  const storageKeys = ['studify:userId', 'user_id', 'userId']

  for (const key of storageKeys) {
    const value = window.localStorage.getItem(key)
    if (value) return value
  }

  return null
}
