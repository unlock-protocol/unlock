import { CheckoutConfig } from '@unlock-protocol/core'
import { describe, expect, it } from 'vitest'
import { getCheckoutUrl } from '~/components/content/event/utils'

describe('getCheckoutUrl', () => {
  it('uses canonical path-based URLs for saved checkout configs', () => {
    const checkoutConfig = {
      id: '2c1549c0-baea-4445-82e9-ab3bd3251162',
      config: {
        locks: {},
      },
    } as CheckoutConfig

    const url = getCheckoutUrl(checkoutConfig)

    expect(url).toBe(
      'http://localhost:3000/checkout/2c1549c0-baea-4445-82e9-ab3bd3251162'
    )
  })

  it('keeps inline checkout configs on the query-string checkout route', () => {
    const checkoutConfig = {
      config: {
        locks: {
          '0x123': {
            network: 1,
          },
        },
        redirectUri: '',
      },
    } as CheckoutConfig

    const url = new URL(getCheckoutUrl(checkoutConfig))

    expect(url.pathname).toBe('/checkout')
    expect(url.searchParams.get('checkoutConfig')).toBe(
      JSON.stringify({
        locks: {
          '0x123': {
            network: 1,
          },
        },
      })
    )
    expect(checkoutConfig.config.redirectUri).toBe('')
  })
})
