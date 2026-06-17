import { FlashcardResultsClient } from '@/components/flashcards/FlashcardResultsClient'

interface FlashcardResultsPageProps {
  params: Promise<{ topicId: string }>
}

export default async function FlashcardResultsPage({ params }: FlashcardResultsPageProps) {
  const { topicId } = await params

  return <FlashcardResultsClient topicId={topicId} />
}
