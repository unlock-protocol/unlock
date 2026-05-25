// @vitest-environment jsdom

import { CheckoutConfig } from '@unlock-protocol/core'
import { describe, expect, it, vi } from 'vitest'
import { getCheckoutUrl } from '~/components/content/event/utils'

vi.mock('~/config/app', () => ({
  config: {
    unlockApp: 'https://app.unlock-protocol.com',
  },
}))

describe('getCheckoutUrl', () => {
  it('uses canonical path-based checkout URLs when a checkout ID exists', () => {
    expect(
      getCheckoutUrl({
        id: '2c1549c0-baea-4445-82e9-ab3bd3251162',
        config: {
          locks: {},
        },
      } as unknown as CheckoutConfig)
    ).toBe(
      `${window.location.origin}/checkout/2c1549c0-baea-4445-82e9-ab3bd3251162`
    )
  })

  it('keeps query-based checkout config URLs when there is no checkout ID', () => {
    const config = {
      title: 'Direct checkout config',
      redirectUri: '',
      locks: {},
    }

    const url = new URL(
      getCheckoutUrl({
        config,
      } as unknown as CheckoutConfig)
    )

    expect(url.pathname).toBe('/checkout')
    expect(url.searchParams.has('paywallConfig')).toBe(true)
    expect(JSON.parse(url.searchParams.get('paywallConfig')!)).toEqual({
      title: 'Direct checkout config',
      locks: {},
    })
    expect(config.redirectUri).toBe('')
  })
})
