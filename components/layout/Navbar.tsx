'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { BookOpen, LayoutDashboard, Brain, FlipHorizontal, FileStack, BarChart2, Menu, X } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { LanguageToggle } from './LanguageToggle'
import { LogoutButton } from './LogoutButton'
import { cn } from '@/lib/utils'

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
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Open menu"
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
      </header>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r bg-background/95 backdrop-blur-md shadow-xl p-6 transition-transform duration-300 ease-in-out md:hidden flex flex-col gap-6",
        isOpen ? "translate-x-0" : "-translate-x-full invisible"
      )}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary" onClick={() => setIsOpen(false)}>
            <BookOpen className="h-6 w-6" />
            <span className="text-xl">Studify</span>
          </Link>
          <button
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav className="flex flex-col space-y-1.5 flex-1">
          {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Icon className="h-5 w-5 text-primary/70" />
              {t(labelKey as any)}
            </Link>
          ))}
        </nav>

        {/* Drawer Footer */}
        <div className="border-t pt-4 flex items-center justify-between">
          <LanguageToggle />
          <LogoutButton />
        </div>
      </div>
    </>
  )
}
