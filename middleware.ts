import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const APP_ROUTES = /\/(pt-BR|en)\/(dashboard|topics|quiz|flashcards|materials|stats)/
const AUTH_ROUTES = /\/(pt-BR|en)\/(login|register)/

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const localeMatch = pathname.match(/^\/(pt-BR|en)/)
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale

  if (APP_ROUTES.test(pathname) && !user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  if (AUTH_ROUTES.test(pathname) && user) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|icons|.*\\..*).*)'],
}
