import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-semibold">
        {t('welcome')}, {user?.email}
      </h1>
    </div>
  )
}
