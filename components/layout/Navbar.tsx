'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { BookOpen, LayoutDashboard, Brain, FlipHorizontal, FileStack, BarChart2, Menu, X } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
            <BookOpen className="h-5 w-5" />
            <span className="hidden sm:inline-block">Studify</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {t(labelKey as any)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <LogoutButton />
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="border-b bg-background md:hidden">
          <div className="flex flex-col space-y-1 p-4">
            {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {t(labelKey as any)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
