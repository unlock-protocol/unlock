import { describe, expect, it } from 'vitest'
import { getCrossChainRoutePayment } from '../../utils/crossChainRoute'

describe('getCrossChainRoutePayment', () => {
  it('formats the route token amount with token decimals', () => {
    expect(
      getCrossChainRoutePayment({
        symbol: 'usdc',
        tokenPayment: {
          amount: '1234500',
          decimals: 6,
          symbol: 'usdc',
        },
      })
    ).toEqual({
      amount: '1.2345',
      symbol: 'usdc',
    })
  })

  it('uses the route currency for native payments', () => {
    expect(
      getCrossChainRoutePayment({
        currency: 'eth',
        symbol: 'ignored',
        tokenPayment: {
          amount: '2500000000000000',
          decimals: 18,
          isNative: true,
        },
      })
    ).toEqual({
      amount: '0.0025',
      symbol: 'eth',
    })
  })

  it('returns null when the route has no display symbol', () => {
    expect(
      getCrossChainRoutePayment({
        tokenPayment: {
          amount: '1000000',
          decimals: 6,
        },
      })
    ).toBeNull()
  })
})
