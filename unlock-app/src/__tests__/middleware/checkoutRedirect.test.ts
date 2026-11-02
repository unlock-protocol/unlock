// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { config, middleware } from '../../../middleware'

const id = '2c1549c0-baea-4445-82e9-ab3bd3251162'
const origin = 'https://app.unlock-protocol.com'

describe('checkout middleware', () => {
  it('only runs on /checkout', () => {
    expect.assertions(1)
    expect(config.matcher).toBe('/checkout')
  })

  it('permanently redirects /checkout?id=<id> to /checkout/<id>', () => {
    expect.assertions(2)
    const response = middleware(
      new NextRequest(
        `${origin}/checkout?id=${id}&redirectUri=https%3A%2F%2Fexample.com`
      )
    )

    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(
      `${origin}/checkout/${id}?redirectUri=https%3A%2F%2Fexample.com`
    )
  })

  it('lets checkouts without a saved config id through', () => {
    expect.assertions(3)
    for (const query of ['', '?paywallConfig=%7B%7D', '?id=']) {
      const response = middleware(new NextRequest(`${origin}/checkout${query}`))
      expect(response.headers.get('location')).toBeNull()
    }
  })

  it('does not redirect unsafe ids', () => {
    expect.assertions(1)
    const response = middleware(
      new NextRequest(`${origin}/checkout?id=%2F%2Fevil.example`)
    )
    expect(response.headers.get('location')).toBeNull()
  })
})
