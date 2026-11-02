import { describe, expect, it } from 'vitest'
import { CheckoutConfig } from '@unlock-protocol/core'
import { getCheckoutUrl } from '../../../../components/content/event/utils'

describe('getCheckoutUrl', () => {
  it('uses the path-based url for a saved checkout config', () => {
    expect.assertions(1)
    const checkoutConfig = {
      id: '2c1549c0-baea-4445-82e9-ab3bd3251162',
      name: 'Event',
      config: { locks: {} },
    } as unknown as CheckoutConfig

    expect(getCheckoutUrl(checkoutConfig)).toBe(
      `${window.location.origin}/checkout/2c1549c0-baea-4445-82e9-ab3bd3251162`
    )
  })

  it('embeds the config in the query string when there is no saved id', () => {
    expect.assertions(2)
    const config = { locks: {} }
    const checkoutConfig = {
      name: 'Event',
      config,
    } as unknown as CheckoutConfig

    const url = new URL(getCheckoutUrl(checkoutConfig))
    expect(url.pathname).toBe('/checkout')
    expect(url.searchParams.get('checkoutConfig')).toBe(JSON.stringify(config))
  })

  it('drops an empty redirectUri', () => {
    expect.assertions(2)
    const checkoutConfig = {
      id: 'abc',
      name: 'Event',
      config: { locks: {}, redirectUri: '' },
    } as unknown as CheckoutConfig

    expect(getCheckoutUrl(checkoutConfig)).toBe(
      `${window.location.origin}/checkout/abc`
    )
    expect(checkoutConfig.config).not.toHaveProperty('redirectUri')
  })
})
