import { createClient } from '@/lib/supabase/server'
import { TopicsClient } from '@/components/topics/TopicsClient'

export default async function TopicsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <TopicsClient userId={user!.id} />
}
