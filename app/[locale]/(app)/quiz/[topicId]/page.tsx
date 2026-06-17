import { createClient } from '@/lib/supabase/server'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'

interface QuizSessionPageProps {
  params: Promise<{ topicId: string }>
}

export default async function QuizSessionPage({ params }: QuizSessionPageProps) {
  const { topicId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="mx-auto w-full max-w-screen-xl p-6">
      <QuizPlayer topicId={topicId} userId={user!.id} />
    </div>
  )
}
