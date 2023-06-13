import { describe, it, expect, vi } from 'vitest'
import * as pricingOperations from '../../src/operations/pricingOperations'

const lockAddress = '0x551c6ecdf819Dc90c5287971072B4651119accD3'
const lockAddressErc20 = '0x8D33b257bce083eE0c7504C7635D1840b3858AFD'
const network = 5
const decimals = 18
const currencyContractAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
const keyPrice = 40000

// eslint-disable-next-line
var mockWeb3Service = {
  providerForNetwork: vi.fn(),
  getLockContract: vi.fn((lock) => {
    if (lock === lockAddress) {
      return {
        keyPrice: vi.fn(() => keyPrice),
        tokenAddress: vi.fn(() => null),
      }
    }

    // return mock for erc-20
    return {
      keyPrice: vi.fn(() => keyPrice),
      tokenAddress: vi.fn(() => currencyContractAddress),
    }
  }),
}

vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
  getErc20Decimals: function () {
    return 6
  },
}))

describe('pricingOperations', () => {
  beforeEach(() => {
    // mock https://coins.llama.fi response
    fetchMock.mockIf(
      /^https?:\/\/coins.llama.fi\/prices\/current\/.*$/,
      (req) => {
        return '{"coins":{"coingecko:ethereum":{"price":1,"symbol":"ETH","timestamp":1675174381,"confidence":0.99}}}'
      }
    )
  })

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

  describe('getLockKeyPricing', () => {
    it('returns default pricing for ERC20 lock', async () => {
      expect.assertions(3)

      const res = await pricingOperations.getLockKeyPricing({
        lockAddress: lockAddressErc20,
        network,
      })

      expect(res.decimals).toBe(6)
      expect(res.keyPrice).toBe(keyPrice)
      expect(res.currencyContractAddress).toBe(currencyContractAddress)
    })

    it('returns default pricing for a specific lock', async () => {
      expect.assertions(3)

      const res = await pricingOperations.getLockKeyPricing({
        lockAddress,
        network,
      })

      expect(res.decimals).toBe(18)
      expect(res.keyPrice).toBe(keyPrice)
      expect(res.currencyContractAddress).toBe(null)
    })
  })

  describe('getDefiLammaPrice', () => {
    it('returns DefiLamma pricing', async () => {
      expect.assertions(4)
      const pricing = await pricingOperations.getDefiLammaPrice({
        network,
      })

      expect(pricing.price).toBe(1)
      expect(pricing.symbol).toBe('ETH')
      expect(pricing.timestamp).toBe(1675174381)
      expect(pricing.confidence).toBe(0.99)
    })
  })

  describe('getDefaultUsdPricing', () => {
    it('returns default usd pricing', async () => {
      expect.assertions(4)

      const pricing = await pricingOperations.getDefaultUsdPricing({
        lockAddress: lockAddressErc20,
        network,
      })

      expect(pricing.decimals).toBe(6)
      expect(pricing.symbol).toBe('ETH')
      expect(pricing.amountInUSD).toBe(0.04)
      expect(pricing.amountInCents).toBe(4)
    })
  })
})
