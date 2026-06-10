import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(user ? `/${locale}/dashboard` : `/${locale}/login`)
}
