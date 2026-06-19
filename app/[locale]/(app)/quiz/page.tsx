import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuizClient } from '@/components/quiz/QuizClient'

export default async function QuizPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <QuizClient userId={user.id} />
}
