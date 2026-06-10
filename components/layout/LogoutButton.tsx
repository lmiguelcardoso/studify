'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()

  async function handleLogout() {
    await fetch(`/api/auth/logout?locale=${locale}`, { method: 'POST' })
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{t('logout')}</span>
    </Button>
  )
}
