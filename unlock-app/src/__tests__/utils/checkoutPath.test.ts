import { describe, expect, it } from 'vitest'
import {
  getCheckoutPath,
  getLegacyCheckoutRedirect,
  isCheckoutId,
} from '../../utils/checkoutPath'

const id = '2c1549c0-baea-4445-82e9-ab3bd3251162'

describe('isCheckoutId', () => {
  it('accepts uuids and other url-safe ids', () => {
    expect.assertions(3)
    expect(isCheckoutId(id)).toBe(true)
    expect(isCheckoutId('my_checkout-1')).toBe(true)
    expect(isCheckoutId('A')).toBe(true)
  })

  it('rejects empty, missing and unsafe ids', () => {
    expect.assertions(7)
    expect(isCheckoutId('')).toBe(false)
    expect(isCheckoutId(undefined)).toBe(false)
    expect(isCheckoutId(null)).toBe(false)
    expect(isCheckoutId('a/b')).toBe(false)
    expect(isCheckoutId('..%2F..')).toBe(false)
    expect(isCheckoutId('//evil.example')).toBe(false)
    expect(isCheckoutId('a'.repeat(129))).toBe(false)
  })
})

describe('getCheckoutPath', () => {
  it('builds the path-based checkout url', () => {
    expect.assertions(1)
    expect(getCheckoutPath(id)).toBe(`/checkout/${id}`)
  })

  it('encodes the id', () => {
    expect.assertions(1)
    expect(getCheckoutPath('a b')).toBe('/checkout/a%20b')
  })
})

describe('getLegacyCheckoutRedirect', () => {
  it('redirects /checkout?id=<id> to /checkout/<id>', () => {
    expect.assertions(1)
    expect(getLegacyCheckoutRedirect(new URLSearchParams({ id }))).toBe(
      `/checkout/${id}`
    )
  })

  it('keeps the other query parameters, in order, without the id', () => {
    expect.assertions(1)
    const params = new URLSearchParams()
    params.append('redirectUri', 'https://example.com/thanks?x=1')
    params.append('id', id)
    params.append(
      'referrerAddress',
      '0x1234567890123456789012345678901234567890'
    )

    expect(getLegacyCheckoutRedirect(params)).toBe(
      `/checkout/${id}?redirectUri=https%3A%2F%2Fexample.com%2Fthanks%3Fx%3D1&referrerAddress=0x1234567890123456789012345678901234567890`
    )
  })

  it('keeps repeated query parameters', () => {
    expect.assertions(1)
    expect(
      getLegacyCheckoutRedirect(new URLSearchParams(`id=${id}&tag=a&tag=b`))
    ).toBe(`/checkout/${id}?tag=a&tag=b`)
  })

  it('uses the first value when the id is repeated, like searchParams.get', () => {
    expect.assertions(1)
    expect(
      getLegacyCheckoutRedirect(new URLSearchParams(`id=${id}&id=other`))
    ).toBe(`/checkout/${id}`)
  })

  it('does not redirect checkouts without a saved config id', () => {
    expect.assertions(3)
    expect(getLegacyCheckoutRedirect(new URLSearchParams())).toBeNull()
    expect(getLegacyCheckoutRedirect(new URLSearchParams('id='))).toBeNull()
    expect(
      getLegacyCheckoutRedirect(
        new URLSearchParams({ paywallConfig: '{"locks":{}}' })
      )
    ).toBeNull()
  })

  it('does not redirect unsafe ids (no open redirect, no path traversal)', () => {
    expect.assertions(3)
    expect(
      getLegacyCheckoutRedirect(new URLSearchParams({ id: '//evil.example' }))
    ).toBeNull()
    expect(
      getLegacyCheckoutRedirect(new URLSearchParams({ id: '../locks' }))
    ).toBeNull()
    expect(
      getLegacyCheckoutRedirect(new URLSearchParams({ id: 'a?b=c' }))
    ).toBeNull()
  })
})
