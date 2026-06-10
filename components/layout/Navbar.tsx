import { useTranslations } from 'next-intl'
import { BookOpen, LayoutDashboard, Brain, FlipHorizontal, FileStack, BarChart2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { LanguageToggle } from './LanguageToggle'
import { LogoutButton } from './LogoutButton'

const NAV_LINKS = [
  { href: '/dashboard' as const, labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/topics' as const, labelKey: 'topics', icon: BookOpen },
  { href: '/quiz' as const, labelKey: 'quiz', icon: Brain },
  { href: '/flashcards' as const, labelKey: 'flashcards', icon: FlipHorizontal },
  { href: '/materials' as const, labelKey: 'materials', icon: FileStack },
  { href: '/stats' as const, labelKey: 'stats', icon: BarChart2 },
]

export function Navbar() {
  const t = useTranslations('nav')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
            <BookOpen className="h-5 w-5" />
            Studify
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {t(labelKey as Parameters<typeof t>[0])}
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
