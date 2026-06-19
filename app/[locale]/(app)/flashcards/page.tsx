import { createClient } from '@/lib/supabase/server'
import { FlashcardsClient } from '@/components/flashcards/FlashcardsClient'

export default async function FlashcardsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <FlashcardsClient userId={user!.id} />
}
