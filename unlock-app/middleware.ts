import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')

  // Saved checkout IDs are UUIDs; leave inline and malformed configurations alone.
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = `/checkout/${id}`
  url.searchParams.delete('id')
  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: '/checkout',
}
