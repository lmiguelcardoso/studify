import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const locale = await getLocale()
    redirect(`/${locale}/login`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  )
}
