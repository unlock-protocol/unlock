import { describe, expect, it } from 'vitest'
import {
  getCanonicalCheckoutPath,
  getCanonicalCheckoutUrl,
} from '../../utils/checkoutUrl'

describe('checkoutUrl', () => {
  it('builds canonical checkout paths from ids', () => {
    expect(
      getCanonicalCheckoutPath('2c1549c0-baea-4445-82e9-ab3bd3251162')
    ).toBe('/checkout/2c1549c0-baea-4445-82e9-ab3bd3251162')
  })

  it('encodes ids for path usage', () => {
    expect(getCanonicalCheckoutPath(' config id ')).toBe(
      '/checkout/config%20id'
    )
  })

  it('builds absolute canonical checkout urls', () => {
    expect(
      getCanonicalCheckoutUrl(
        'https://app.unlock-protocol.com',
        '2c1549c0-baea-4445-82e9-ab3bd3251162'
      )
    ).toBe(
      'https://app.unlock-protocol.com/checkout/2c1549c0-baea-4445-82e9-ab3bd3251162'
    )
  })
})
