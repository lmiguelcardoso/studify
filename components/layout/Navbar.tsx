import { useTranslations } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { BookOpen, LayoutDashboard, Brain, FlipHorizontal, FileStack, BarChart2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { LanguageToggle } from './LanguageToggle'
import { LogoutButton } from './LogoutButton'

export async function Navbar() {
  const t = useTranslations('nav')
  const locale = await getLocale()

  const links = [
    { href: `/${locale}/dashboard`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/topics`, label: t('topics'), icon: BookOpen },
    { href: `/${locale}/quiz`, label: t('quiz'), icon: Brain },
    { href: `/${locale}/flashcards`, label: t('flashcards'), icon: FlipHorizontal },
    { href: `/${locale}/materials`, label: t('materials'), icon: FileStack },
    { href: `/${locale}/stats`, label: t('stats'), icon: BarChart2 },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 font-bold text-primary">
            <BookOpen className="h-5 w-5" />
            Studify
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
