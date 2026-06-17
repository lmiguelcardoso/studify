import { createClient } from '@/lib/supabase/server'
import { TopicDetailClient } from '@/components/topics/TopicDetailClient'

interface TopicDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <TopicDetailClient topicId={id} userId={user!.id} />
}
