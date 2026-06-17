import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import enMessages from '@/messages/en.json'
import ptBRMessages from '@/messages/pt-BR.json'

type LocaleLayoutProps = {
  children: ReactNode
  params: Promise<{
    locale: string
  }>
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params
  const messages = locale === 'en' ? enMessages : ptBRMessages

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
