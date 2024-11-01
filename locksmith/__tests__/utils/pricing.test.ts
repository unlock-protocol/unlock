import { expect, describe, beforeEach, it, vi } from 'vitest'
import {
  createPricingForPurchase,
  getFees,
  getKeyPricingInFiat,
} from '../../src/utils/pricing'
import { DEFAULT_LOCK_SETTINGS } from '../../src/controllers/v2/lockSettingController'

const recipients = [
  '0x6f59999AE79Bc593549918179454A47980a800E5',
  '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
]
const data = ['0x', '0x']

const lockAddressWithSettings = '0xBd55144A3A30907E080595cabF652Bc079728B2f'
const lockWithEurCurrency = '0x1a1D8b22555521D9E664981Af56438e8aCe2134E'
const currencyContractAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
const cabinDaoLock = '0x45aCCac0E5C953009cDa713a3b722F87F2907F86'

const lockAddress = '0x551c6ecdf819Dc90c5287971072B4651119accD3'
const network = 10
const keyPrice = 9000000000000000
const gasPrice = 12.4
vi.mock('../../src/operations/lockSettingOperations', () => {
  return {
    getSettings: vi.fn(({ lockAddress: lock }) => {
      if ([lockAddressWithSettings].includes(lock)) {
        return Promise.resolve({
          unlockFeeChargedToUser: false,
          sendEmail: true,
          creditCardPrice: 5532, // 55.32$ in basis points
        })
      }

      if ([lockWithEurCurrency].includes(lock)) {
        return Promise.resolve({
          sendEmail: true,
          creditCardPrice: 5812, // 55.32$ in basis points
          creditCardCurrency: 'eur',
        })
      }

      if ([cabinDaoLock].includes(lock)) {
        return Promise.resolve({
          sendEmail: true,
          creditCardPrice: 4444, // 44.44$ in basis points
          creditCardCurrency: 'eur',
          unlockFeeChargedToUser: false,
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

  afterEach(() => {
    fetchMock.resetMocks()
  })

  describe('getKeyPricingInFiat', () => {
    it('returns key pricing for recipients', async () => {
      expect.assertions(2)
      const fiatPricing = await getKeyPricingInFiat({
        lockAddress,
        network,
        recipients,
        data,
        referrers: [],
      })

      expect(fiatPricing.length).toBe(2)
      expect(fiatPricing).toMatchObject([
        {
          address: '0x6f59999AE79Bc593549918179454A47980a800E5',
          price: {
            amount: 0.009,
            decimals: 0,
          },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: {
            amount: 0.009,
            decimals: 0,
          },
        },
      ])
    })

    it('returns USD key pricing for recipients with "creditCard" lock setting price', async () => {
      expect.assertions(2)
      const fiatPricing = await getKeyPricingInFiat({
        lockAddress: lockAddressWithSettings,
        network,
        recipients,
        data,
        referrers: [],
      })

      expect(fiatPricing.length).toBe(2)
      expect(fiatPricing).toMatchObject([
        {
          address: '0x6f59999AE79Bc593549918179454A47980a800E5',
          price: {
            amount: 55.32,
            decimals: 0,
            currency: 'usd',
          },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: {
            amount: 55.32,
            decimals: 0,
            currency: 'usd',
          },
        },
      ])
    })

    it('returns EUR key pricing for recipients with "creditCard" lock setting price', async () => {
      expect.assertions(2)
      const fiatPricing = await getKeyPricingInFiat({
        lockAddress: lockWithEurCurrency,
        network,
        recipients,
        data,
        referrers: [],
      })

      expect(fiatPricing.length).toBe(2)
      expect(fiatPricing).toMatchObject([
        {
          address: '0x6f59999AE79Bc593549918179454A47980a800E5',
          price: {
            amount: 58.12,
            decimals: 0,
            currency: 'eur',
          },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: {
            amount: 58.12,
            decimals: 0,
            currency: 'eur',
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
            decimals: 0,
            currency: 'usd',
          },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: {
            amount: 0.009,
            decimals: 0,
            currency: 'usd',
          },
        },
      ])
    })

    it('returns USD purchase price with "creditCard" setting price', async () => {
      expect.assertions(9)
      const pricingForPurchase = await createPricingForPurchase({
        lockAddress: lockAddressWithSettings,
        network,
        recipients,
        referrers: [],
        data,
      })

      expect(pricingForPurchase?.unlockServiceFee).toBe(5.532)
      expect(pricingForPurchase?.creditCardProcessingFee).toBe(4.028588)
      expect(pricingForPurchase?.gasCost).toBe(12.4)
      expect(pricingForPurchase?.gasCost).toBe(12.4)
      expect(pricingForPurchase?.currency).toBe('usd')
      expect(pricingForPurchase?.subtotal).toBe(110.64)
      expect(pricingForPurchase?.isCreditCardPurchasable).toBe(true)
      expect(pricingForPurchase?.recipients.length).toBe(2)
      expect(pricingForPurchase?.recipients).toMatchObject([
        {
          address: '0x6f59999AE79Bc593549918179454A47980a800E5',
          price: { currency: 'usd', amount: 55.32, decimals: 0 },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: { currency: 'usd', amount: 55.32, decimals: 0 },
        },
      ])
    })

    it('returns EUR purchase price with "creditCard" setting price', async () => {
      expect.assertions(2)
      const pricingForPurchase = await createPricingForPurchase({
        lockAddress: lockWithEurCurrency,
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
            amount: 58.12,
            decimals: 0,
            currency: 'eur',
          },
        },
        {
          address: '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
          price: {
            amount: 58.12,
            decimals: 0,
            currency: 'eur',
          },
        },
      ])
    })
    it('return pricing for purchase without unlockFees', async () => {
      expect.assertions(1)
      const pricingForPurchase = await createPricingForPurchase({
        lockAddress: lockAddressWithSettings,
        network,
        recipients,
        referrers: [],
        data,
      })

      // total without unlockFees
      const total =
        pricingForPurchase.gasCost +
        pricingForPurchase.subtotal +
        pricingForPurchase.creditCardProcessingFee

      expect(pricingForPurchase.total).toBe(total)
    })

    it('return pricing for purchase with unlockFees', async () => {
      expect.assertions(1)
      const pricingForPurchase = await createPricingForPurchase({
        lockAddress,
        network,
        recipients,
        referrers: [],
        data,
      })

      // total with unlockFees
      const total =
        pricingForPurchase.gasCost +
        pricingForPurchase.subtotal +
        pricingForPurchase.creditCardProcessingFee +
        pricingForPurchase.unlockServiceFee

      expect(pricingForPurchase.total).toBe(total)
    })
  })

  describe('getFees', () => {
    it('should not have unlockServiceFee to zero', async () => {
      expect.assertions(1)
      const fees = await getFees(
        {
          subtotal: 1430,
          gasCost: 10,
        },
        {
          lockAddress: lockAddressWithSettings,
          network: 5,
          recipients: ['0x'],
        }
      )
      expect(fees.unlockServiceFee).not.toBe(0)
    })

    it('should include unlockFees of 5%', async () => {
      expect.assertions(1)
      const fees = await getFees(
        {
          subtotal: 52,
          gasCost: 0.12,
        },
        {
          lockAddress,
          network: 5,
          recipients: ['0x'],
        }
      )
      expect(fees.unlockServiceFee).toBe(2.6)
    })

    it('should include unlockFees of at least at 1$', async () => {
      expect.assertions(1)
      const fees = await getFees(
        {
          subtotal: 1,
          gasCost: 0.12,
        },
        {
          lockAddress,
          network: 5,
          recipients: ['0x'],
        }
      )
      expect(fees.unlockServiceFee).toBe(1)
    })

    it('should include unlockFees capped at 10$', async () => {
      expect.assertions(1)
      const fees = await getFees(
        {
          subtotal: 1430,
          gasCost: 10,
        },
        {
          lockAddress,
          network: 5,
          recipients: ['0x'],
        }
      )
      expect(fees.unlockServiceFee).toBe(10)
    })

    it('should return cabinDao unlockFess', async () => {
      expect.assertions(2)

      const fees = await getFees(
        {
          subtotal: 1430,
          gasCost: 10,
        },
        {
          lockAddress: cabinDaoLock,
          network: 5,
          recipients: ['0x'],
        }
      )

      expect(fees.unlockServiceFee).toBe(20) // should not be zero

      const pricingForPurchase = await createPricingForPurchase({
        lockAddress: cabinDaoLock,
        network,
        recipients,
        referrers: [],
        data,
      })

      // total without unlockFees
      const total =
        pricingForPurchase.gasCost +
        pricingForPurchase.subtotal +
        pricingForPurchase.creditCardProcessingFee

      expect(pricingForPurchase.total).toBe(total)
    })
  })
})
