import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/routing'
import { getSupabasePublishableKey } from '@/lib/supabase/env'

const intlMiddleware = createIntlMiddleware(routing)

// With localePrefix: 'never', URLs have no locale segment - match plain paths.
const APP_ROUTES = /^\/(dashboard|topics|quiz|flashcards|materials|stats)(\/.*)?$/
const AUTH_ROUTES = /^\/(login|register)$/

export async function proxy(request: NextRequest) {
  const response = intlMiddleware(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabasePublishableKey()!,
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

  if (APP_ROUTES.test(pathname) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (AUTH_ROUTES.test(pathname) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|icons|.*\\..*).*)'],
}
