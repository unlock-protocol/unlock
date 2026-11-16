import { NextRequest, NextResponse } from 'next/server'
import { getLegacyCheckoutRedirect } from './src/utils/checkoutPath'

// Permanently redirect the legacy `/checkout?id=<id>` URL to the canonical
// path-based `/checkout/<id>`, keeping all other query parameters. Checkouts
// without a saved config id (e.g. `/checkout?paywallConfig=...`) pass through.
export function middleware(request: NextRequest) {
  const redirectTo = getLegacyCheckoutRedirect(request.nextUrl.searchParams)

  if (!redirectTo) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL(redirectTo, request.url), 308)
}

export const config = {
  matcher: '/checkout',
}
