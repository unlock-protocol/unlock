// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getCheckoutUrl } from '../../components/content/event/utils'

vi.mock('~/config/app', () => ({ config: {} }))

describe('getCheckoutUrl', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: new URL('http://localhost:3000') })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses the canonical path for a saved checkout', () => {
    const id = '2c1549c0-baea-4445-82e9-ab3bd3251162'

    expect(
      getCheckoutUrl({ id, name: 'Saved checkout', config: { locks: {} } })
    ).toBe(`${window.location.origin}/checkout/${id}`)
  })

  it('keeps inline checkout configurations in the query string', () => {
    const config = { locks: {} }
    const url = new URL(
      getCheckoutUrl({ id: null, name: 'Inline checkout', config })
    )

    expect(url.pathname).toBe('/checkout')
    expect(url.searchParams.get('id')).toBeNull()
    expect(JSON.parse(url.searchParams.get('checkoutConfig')!)).toEqual(config)
  })
})
