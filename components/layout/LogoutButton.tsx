'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const t = useTranslations('auth')
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{t('logout')}</span>
    </Button>
  )
}
