// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '../../../middleware'

const origin = 'https://app.unlock-protocol.com'
const id = '2c1549c0-baea-4445-82e9-ab3bd3251162'

describe('legacy checkout URLs', () => {
  it('permanently redirects a saved checkout to its canonical path', () => {
    const response = middleware(new NextRequest(`${origin}/checkout?id=${id}`))

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(`${origin}/checkout/${id}`)
  })

  it('preserves all other query parameters and removes repeated IDs', () => {
    const url = new URL('/checkout', origin)
    url.searchParams.append('id', id)
    url.searchParams.append('referrerAddress', '0x123')
    url.searchParams.append('redirectUri', 'https://example.com/thanks?a=1&b=2')
    url.searchParams.append('tag', 'first')
    url.searchParams.append('tag', 'second')
    url.searchParams.append('id', 'another-checkout')
    const response = middleware(new NextRequest(url))
    const destination = new URL(response.headers.get('location')!)

    expect(response.status).toBe(308)
    expect(destination.pathname).toBe(`/checkout/${id}`)
    expect(destination.searchParams.has('id')).toBe(false)
    expect(destination.searchParams.get('referrerAddress')).toBe('0x123')
    expect(destination.searchParams.get('redirectUri')).toBe(
      'https://example.com/thanks?a=1&b=2'
    )
    expect(destination.searchParams.getAll('tag')).toEqual(['first', 'second'])
  })

  it.each([
    '/checkout',
    '/checkout?paywallConfig=%7B%22locks%22%3A%7B%7D%7D',
    '/checkout?checkoutConfig=%7B%22locks%22%3A%7B%7D%7D',
    '/checkout?client_id=test&redirect_uri=https%3A%2F%2Fexample.com',
    '/checkout?id=&paywallConfig=%7B%7D',
    '/checkout?id=%20',
    '/checkout?id=..',
    '/checkout?id=..%2Fother',
    '/checkout?id=%2F%2Fexample.com',
    '/checkout?id=%5Cexample.com',
    '/checkout?id=first%3Fsecond%23third',
  ])('leaves no-ID and malformed checkouts unchanged: %s', (path) => {
    const response = middleware(new NextRequest(new URL(path, origin)))

    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})
