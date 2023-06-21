import { expect, describe, beforeEach, it, vi } from 'vitest'
import {
  createPricingForPurchase,
  getKeyPricingInUSD,
} from '../../src/utils/pricing'
import { DEFAULT_LOCK_SETTINGS } from '../../src/controllers/v2/lockSettingController'

const recipients = [
  '0x6f59999AE79Bc593549918179454A47980a800E5',
  '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
]
const data = ['0x', '0x']

const lockAddressWithSettings = '0xbd55144a3a30907e080595cabf652bc079728b2f'
const currencyContractAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

const lockAddress = '0x551c6ecdf819Dc90c5287971072B4651119accD3'
const network = 5
const keyPrice = 9000000000000000
const gasPrice = 12.4
vi.mock('../../src/operations/lockSettingOperations', () => {
  return {
    getSettings: vi.fn(({ lockAddress: lock }) => {
      if ([lockAddressWithSettings].includes(lock)) {
        return Promise.resolve({
          sendEmail: true,
          creditCardPrice: 5532, // 55.32$ in basis points
        })
      }

      return Promise.resolve(DEFAULT_LOCK_SETTINGS)
    }),
  }
})

vi.mock('../../src/utils/gasPrice', async () => {
  const actual: any = await vi.importActual('../../src/utils/gasPrice')
  return {
    ...actual,
    gasPriceUSD: vi.fn(() => gasPrice),
  }
})

vi.mock('../../src/utils/gasPrice', () => {
  const mockedGasPrice = vi.fn().mockImplementation(() => {
    const item = {
      gasPriceUSD: vi.fn().mockReturnValue(gasPrice),
      gasPriceETH: vi.fn().mockReturnValue(gasPrice),
    }
    return item
  })
  return {
    default: mockedGasPrice,
  }
})

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
  purchasePriceFor: vi.fn(() => keyPrice),
}

vi.mock('@unlock-protocol/unlock-js', () => ({
  Web3Service: function Web3Service() {
    return mockWeb3Service
  },
  getErc20Decimals: function () {
    return 6
  },
}))

describe('pricing', () => {
  beforeEach(() => {
    // mock https://coins.llama.fi response
    fetchMock.mockIf(
      /^https?:\/\/coins.llama.fi\/prices\/current\/.*$/,
      (req) => {
        return '{"coins":{"coingecko:ethereum":{"price":1,"symbol":"ETH","timestamp":1675174381,"confidence":0.99}}}'
      }
    )
  })

  describe('getKeyPricingInUSD', () => {
    it('returns key pricing for recipients', async () => {
      expect.assertions(2)
      const usdPricing = await getKeyPricingInUSD({
        lockAddress,
        network,
        recipients,
        data,
        referrers: [],
      })

      expect(usdPricing.length).toBe(2)
      expect(usdPricing).toMatchObject([
        {
          address: '0x6f59999AE79Bc593549918179454A47980a800E5',
          price: {
            amount: 0.009,
            decimals: 18,
            symbol: 'ETH',
            amountInUSD: 0.009,
          },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: {
            amount: 0.009,
            decimals: 18,
            symbol: 'ETH',
            amountInUSD: 0.009,
          },
        },
      ])
    })

    it('returns key pricing for recipients with "creditCard" lock setting price', async () => {
      expect.assertions(2)
      const usdPricing = await getKeyPricingInUSD({
        lockAddress: lockAddressWithSettings,
        network,
        recipients,
        data,
        referrers: [],
      })

      expect(usdPricing.length).toBe(2)
      expect(usdPricing).toMatchObject([
        {
          address: '0x6f59999AE79Bc593549918179454A47980a800E5',
          price: {
            amount: 55.32,
            decimals: 18,
            symbol: '$',
            amountInUSD: 55.32,
            amountInCents: 5532,
          },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: {
            amount: 55.32,
            decimals: 18,
            symbol: '$',
            amountInUSD: 55.32,
            amountInCents: 5532,
          },
        },
      ])
    })
  })

  describe('createPricingForPurchase', () => {
    it('return pricing for purchase', async () => {
      expect.assertions(2)
      const pricingForPurchase = await createPricingForPurchase({
        lockAddress,
        network,
        recipients,
        referrers: [],
        data,
      })

      expect(pricingForPurchase.recipients.length).toBe(2)
      expect(pricingForPurchase.recipients).toMatchObject([
        {
          address: '0x6f59999AE79Bc593549918179454A47980a800E5',
          price: {
            amount: 0.009,
            decimals: 18,
            symbol: 'ETH',
            amountInUSD: 0.009,
          },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: {
            amount: 0.009,
            decimals: 18,
            symbol: 'ETH',
            amountInUSD: 0.009,
          },
        },
      ])
    })

    it('returns purchase price with "creditCard" setting price', async () => {
      expect.assertions(2)
      const pricingForPurchase = await createPricingForPurchase({
        lockAddress: lockAddressWithSettings,
        network,
        recipients,
        referrers: [],
        data,
      })

      expect(pricingForPurchase.recipients.length).toBe(2)
      expect(pricingForPurchase.recipients).toMatchObject([
        {
          address: '0x6f59999AE79Bc593549918179454A47980a800E5',
          price: {
            amount: 55.32,
            decimals: 18,
            symbol: '$',
            amountInUSD: 55.32,
            amountInCents: 5532,
          },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: {
            amount: 55.32,
            decimals: 18,
            symbol: '$',
            amountInUSD: 55.32,
            amountInCents: 5532,
          },
        },
      ])
    })
  })
})
