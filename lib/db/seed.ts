import { db } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'

export async function seedLocalDB(userId: string) {
  const supabase = createClient()

  const [topics, questions, flashcards, materials] = await Promise.all([
    supabase.from('topics').select('*').eq('user_id', userId),
    supabase.from('questions').select('*').eq('user_id', userId),
    supabase.from('flashcards').select('*').eq('user_id', userId),
    supabase.from('materials').select('*').eq('user_id', userId),
  ])

  await db.transaction(
    'rw',
    [db.topics, db.questions, db.flashcards, db.materials],
    async () => {
      if (topics.data?.length) await db.topics.bulkPut(topics.data)
      if (questions.data?.length) await db.questions.bulkPut(questions.data)
      if (flashcards.data?.length) await db.flashcards.bulkPut(flashcards.data)
      if (materials.data?.length) await db.materials.bulkPut(materials.data)
    }
  )
}
