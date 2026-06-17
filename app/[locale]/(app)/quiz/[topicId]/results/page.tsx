import { QuizResultsClient } from '@/components/quiz/QuizResultsClient'

interface QuizResultsPageProps {
  params: Promise<{ topicId: string }>
}

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
  const { topicId } = await params

  return <QuizResultsClient topicId={topicId} />
}
