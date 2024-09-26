import { describe, it, expect, vi } from 'vitest'
import * as pricingOperations from '../../src/operations/pricingOperations'
import { DEFAULT_LOCK_SETTINGS } from '../../src/controllers/v2/lockSettingController'
import { ethers } from 'ethers'

const lockAddress = '0x551c6ecdf819Dc90c5287971072B4651119accD3'
const lockAddressErc20 = '0x8D33b257bce083eE0c7504C7635D1840b3858AFD'
const lockAddressWithSettings = '0xBd55144A3A30907E080595cabF652Bc079728B2f'
const lockAddressWithoutSettings = '0x0dDf835Dc0C326c4A677a807b21Af1d7a521F275'
const lockWithEurCurrency = '0x1a1D8b22555521D9E664981Af56438e8aCe2134E'
const network = 10
const decimals = 18
const currencyContractAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
const keyPrice = 40000

const recipients = [
  '0x6f59999AE79Bc593549918179454A47980a800E5',
  '0x9aBa7eeb134Fa94dfe735205DdA6aC6447d76F9b',
]

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

vi.mock('../../src/operations/lockSettingOperations', () => {
  return {
    getSettings: vi.fn(({ lockAddress: lock }) => {
      if ([lockAddress, lockAddressWithSettings].includes(lock)) {
        return Promise.resolve({
          sendEmail: true,
          creditCardPrice: 5532, // 55.32$ in basis points
        })
      }

      if ([lockWithEurCurrency].includes(lock)) {
        return Promise.resolve({
          sendEmail: true,
          creditCardPrice: 5532, // 55.32$ in basis points
          creditCardCurrency: 'eur',
        })
      }

      return Promise.resolve(DEFAULT_LOCK_SETTINGS)
    }),
  }
})

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

  describe('getCurrencySymbol', () => {
    it('returns EUR symbol', () => {
      expect.assertions(1)
      const symbol = pricingOperations.getCurrencySymbol('eur')
      expect(symbol).toBe('€')
    })

    it('returns USD symbol', () => {
      expect.assertions(1)
      const symbol = pricingOperations.getCurrencySymbol('usd')
      expect(symbol).toBe('$')
    })

    it('returns default symbol', () => {
      expect.assertions(1)
      const symbol = pricingOperations.getCurrencySymbol()
      expect(symbol).toBe('$')
    })
  })
  describe('getLockKeyPricingFromContract', () => {
    it('returns default pricing for ERC20 lock', async () => {
      expect.assertions(3)

      const res = await pricingOperations.getLockKeyPricingFromContract({
        lockAddress: lockAddressErc20,
        network,
      })

      expect(res.decimals).toBe(6)
      expect(res.keyPrice).toBe(keyPrice)
      expect(res.currencyContractAddress).toBe(currencyContractAddress)
    })

    it('returns default pricing for a specific lock', async () => {
      expect.assertions(3)

      const res = await pricingOperations.getLockKeyPricingFromContract({
        lockAddress,
        network,
      })

      expect(res.decimals).toBe(18)
      expect(res.keyPrice).toBe(keyPrice)
      expect(res.currencyContractAddress).toBe(null)
    })
  })

  describe('getDefiLlamaPrice', () => {
    it('returns DefiLamma pricing', async () => {
      expect.assertions(4)
      const pricing = await pricingOperations.getDefiLlamaPrice({
        network,
      })

      expect(pricing.price).toBe(1)
      expect(pricing.symbol).toBe('$')
      expect(pricing.timestamp).toBe(1675174381)
      expect(pricing.confidence).toBe(0.99)
    })
  })

  describe('getDefaultFiatPricing', () => {
    it('returns default usd pricing', async () => {
      expect.assertions(3)

      const pricing = await pricingOperations.getDefaultFiatPricing({
        lockAddress: lockAddressErc20,
        network,
      })

      expect(pricing.decimals).toBe(0)
      expect(pricing.currency).toBe('usd')
      expect(pricing.amount).toBe(0.04)
    })

    it('returns USD pricing with "creditCard" settings price', async () => {
      expect.assertions(3)

      const pricing = await pricingOperations.getDefaultFiatPricing({
        lockAddress: lockAddressWithSettings,
        network,
      })

      expect(pricing.amount).toBe(55.32)
      expect(pricing.decimals).toBe(0)
      expect(pricing.currency).toBe('usd')
    })

    it('returns EUR pricing with "creditCard" settings price', async () => {
      expect.assertions(3)

      const pricing = await pricingOperations.getDefaultFiatPricing({
        lockAddress: lockWithEurCurrency,
        network,
      })

      expect(pricing.amount).toBe(55.32)
      expect(pricing.decimals).toBe(0)
      expect(pricing.currency).toBe('eur')
    })

    it('returns default usd pricing when "creditCard" settings price is not set', async () => {
      expect.assertions(3)

      const pricing = await pricingOperations.getDefaultFiatPricing({
        lockAddress: lockAddressWithoutSettings,
        network,
      })

      expect(pricing.decimals).toBe(0)
      expect(pricing.currency).toBe('usd')
      expect(pricing.amount).toBe(0.04)
    })
  })

  describe('getFiatPricingForRecipient', () => {
    it('returns default usd pricing when "creditCard" settings price is not set', async () => {
      expect.assertions(4)
      const userAddress = await ethers.Wallet.createRandom().getAddress()
      const referrer = await ethers.Wallet.createRandom().getAddress()

      const pricing = await pricingOperations.getFiatPricingForRecipient({
        lockAddress: lockAddressWithoutSettings,
        network,
        userAddress,
        data: '0x',
        referrer,
      })
      expect(pricing.address).toBe(userAddress)
      expect(pricing.price.currency).toBe('usd')
      expect(pricing.price.amount).toBe(0.04)
      expect(pricing.price.decimals).toBe(0)
    })

    it('returns USD pricing with "creditCard" settings price', async () => {
      expect.assertions(4)
      const userAddress = await ethers.Wallet.createRandom().getAddress()
      const referrer = await ethers.Wallet.createRandom().getAddress()

      const pricing = await pricingOperations.getFiatPricingForRecipient({
        lockAddress: lockAddressWithSettings,
        network,
        userAddress,
        data: '0x',
        referrer,
      })
      expect(pricing.address).toBe(userAddress)
      expect(pricing.price.decimals).toBe(0)
      expect(pricing.price.currency).toBe('usd')
      expect(pricing.price.amount).toBe(55.32)
    })

    it('returns EUR pricing with "creditCard" settings price', async () => {
      expect.assertions(4)
      const userAddress = await ethers.Wallet.createRandom().getAddress()
      const referrer = await ethers.Wallet.createRandom().getAddress()

      const pricing = await pricingOperations.getFiatPricingForRecipient({
        lockAddress: lockWithEurCurrency,
        network,
        userAddress,
        data: '0x',
        referrer,
      })
      expect(pricing.address).toBe(userAddress)
      expect(pricing.price.decimals).toBe(0)
      expect(pricing.price.currency).toBe('eur')
      expect(pricing.price.amount).toBe(55.32)
    })
  })

  describe('getKeyPricingFromSettings', () => {
    it('returns null when pricing when "creditCardPrice" is not set in lockSettings', async () => {
      expect.assertions(1)

      const pricing = await pricingOperations.getKeyPricingFromSettings({
        lockAddress: lockAddressErc20,
        network,
      })

      expect(pricing).toBe(null)
    })

    it('returns USD pricing when "creditCardPrice" is set in lockSettings', async () => {
      expect.assertions(3)

      const pricing = await pricingOperations.getKeyPricingFromSettings({
        lockAddress,
        network,
      })

      expect(pricing?.decimals).toBe(0)
      expect(pricing?.currency).toBe('usd')
      expect(pricing?.amount).toBe(55.32)
    })

    it('returns EUR pricing when "creditCardPrice" is set in lockSettings', async () => {
      expect.assertions(3)

      const pricing = await pricingOperations.getKeyPricingFromSettings({
        lockAddress: lockWithEurCurrency,
        network,
      })

      expect(pricing?.decimals).toBe(0)
      expect(pricing?.currency).toBe('eur')
      expect(pricing?.amount).toBe(55.32)
    })

    it('returns USD pricing when "creditCardPrice" is set in lockSettings for recipients', async () => {
      expect.assertions(3)

      const pricing = await pricingOperations.getKeyPricingFromSettings({
        lockAddress,
        network,
        recipients,
      })

      expect(pricing?.decimals).toBe(0)
      expect(pricing?.currency).toBe('usd')
      expect(pricing?.amount).toBe(55.32)
    })

    it('returns EUR pricing when "creditCardPrice" is set in lockSettings for recipients', async () => {
      expect.assertions(3)

      const pricing = await pricingOperations.getKeyPricingFromSettings({
        lockAddress: lockWithEurCurrency,
        network,
        recipients,
      })

      expect(pricing?.decimals).toBe(0)
      expect(pricing?.currency).toBe('eur')
      expect(pricing?.amount).toBe(55.32)
    })
  })
})
