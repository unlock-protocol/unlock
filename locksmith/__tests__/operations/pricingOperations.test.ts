import { describe, it, expect, vi } from 'vitest'
import * as pricingOperations from '../../src/operations/pricingOperations'

const lockAddress = '0x551c6ecdf819Dc90c5287971072B4651119accD3'
const network = 5
const decimals = 18
const amount = 1

const mockUsdPricing = {
  price: 6.94,
  symbol: 'ETH',
  amount: 2,
  decimals,
}

// eslint-disable-next-line
var mockWeb3Service = {
  isLockManager: vi.fn(() => Promise.resolve(false)),
  getLockContract: vi.fn(() => {
    return {
      keyPrice: vi.fn(() => 12),
      tokenAddress: vi.fn(() => '0x'),
    }
  }),
}
vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
}))

vi.mock('../../src/operations/pricingOperations')
describe('toUsdPricing', () => {
  it('returns usd pricing object', () => {
    expect.assertions(5)

    const usdPricing1 = {
      price: 12.4,
      symbol: 'USDT',
    }
    const res = pricingOperations.toUsdPricing({
      amount: 6,
      usdPricing: usdPricing1,
      decimals,
    })

    expect(res.amount).toBe(6)
    expect(res.amountInUSD).toBe(74.4)
    expect(res.amountInCents).toBe(7440)
    expect(res.symbol).toBe('USDT')
    expect(res.decimals).toBe(18)
  })

  it('returns usd pricing object for single amount', () => {
    expect.assertions(5)

    const usdPricing = {
      price: 4.45,
      symbol: 'UDT',
    }
    const res2 = pricingOperations.toUsdPricing({
      amount: 1,
      usdPricing,
      decimals,
    })

    expect(res2.amount).toBe(1)
    expect(res2.amountInUSD).toBe(4.45)
    expect(res2.amountInCents).toBe(445)
    expect(res2.symbol).toBe('UDT')
    expect(res2.decimals).toBe(18)
  })
})

describe('getDefaultUsdPricing', () => {
  it.skip('returns default pricing for a specific lock', async () => {
    expect.assertions(2)
    const pricingOperationsMock = await import(
      '../../src/operations/pricingOperations'
    )

    pricingOperationsMock.getLockKeyPricing = vi.fn().mockImplementation(() =>
      Promise.resolve({
        amount,
        usdPricing: mockUsdPricing,
        decimals,
      })
    )
    pricingOperationsMock.getDefiLammaPrice = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockUsdPricing))

    const pricing = await pricingOperations.getDefaultUsdPricing({
      lockAddress,
      network,
    })
    expect(pricing).toBe({})
    expect(pricingOperations.getDefaultUsdPricing).toBeCalledWith({
      lockAddress,
      network,
    })
    expect(pricingOperations.getDefaultUsdPricing).toBeCalledWith({
      lockAddress,
      network,
    })
  })
})
