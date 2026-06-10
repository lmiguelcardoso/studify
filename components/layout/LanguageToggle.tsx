'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggle() {
    const next = locale === 'pt-BR' ? 'en' : 'pt-BR'
    router.replace(pathname, { locale: next })
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="font-medium">
      {locale === 'pt-BR' ? 'EN' : 'PT'}
    </Button>
  )
}
