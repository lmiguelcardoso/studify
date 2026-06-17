import { createClient } from '@/lib/supabase/server'
import { FlashcardReviewer } from '@/components/flashcards/FlashcardReviewer'

interface FlashcardReviewPageProps {
  params: Promise<{ topicId: string }>
}

export default async function FlashcardReviewPage({ params }: FlashcardReviewPageProps) {
  const { topicId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="mx-auto w-full max-w-screen-xl p-6">
      <FlashcardReviewer topicId={topicId} userId={user!.id} />
    </div>
  )
}
