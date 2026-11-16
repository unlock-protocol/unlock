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

  describe('checkouts without a checkout id', () => {
    // A checkout can be rendered without a saved config, by passing the config
    // itself in the query string. These URLs must be served unchanged.
    const paywallConfig = encodeURIComponent(
      JSON.stringify({
        locks: {
          '0x54b66CF6b0D089F78595BcdcC8963fAB1EB2294a': { network: 8453 },
        },
        title: 'Membership',
        redirectUri: 'https://example.com/',
      })
    )
    const checkoutConfig = encodeURIComponent(JSON.stringify({ locks: {} }))

    it.each([
      ['no query string', ''],
      ['paywallConfig', `?paywallConfig=${paywallConfig}`],
      [
        'paywallConfig with other parameters',
        `?paywallConfig=${paywallConfig}&referrerAddress=0x1234567890123456789012345678901234567890`,
      ],
      [
        'checkoutConfig (getCheckoutUrl without a saved id)',
        `?checkoutConfig=${checkoutConfig}`,
      ],
      ['an empty id', '?id='],
      ['a blank id', '?id=%20%20'],
    ])('passes %s through', (_name, query) => {
      expect.assertions(3)
      const response = middleware(new NextRequest(`${origin}/checkout${query}`))

      expect(response.status).toBe(200)
      expect(response.headers.get('location')).toBeNull()
      expect(response.headers.get('x-middleware-next')).toBe('1')
    })
  })

  it('does not redirect unsafe ids', () => {
    expect.assertions(1)
    const response = middleware(
      new NextRequest(`${origin}/checkout?id=%2F%2Fevil.example`)
    )
    expect(response.headers.get('location')).toBeNull()
  })
})
