import { describe, it, expect, vi } from 'vitest'
import * as pricingOperations from '../../src/operations/pricingOperations'
import { DEFAULT_LOCK_SETTINGS } from '../../src/controllers/v2/lockSettingController'
import { ethers } from 'ethers'

const lockAddress = '0x551c6ecdf819Dc90c5287971072B4651119accD3'
const lockAddressErc20 = '0x8D33b257bce083eE0c7504C7635D1840b3858AFD'
const lockAddressWithSettings = '0xbd55144a3a30907e080595cabf652bc079728b2f'
const lockAddressWithoutSettings = '0x0ddf835dc0c326c4a677a807b21af1d7a521f275'
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

    it('returns usd pricing with "creditCard" settings price', async () => {
      expect.assertions(5)

      const pricing = await pricingOperations.getDefaultUsdPricing({
        lockAddress: lockAddressWithSettings,
        network,
      })

      expect(pricing.amount).toBe(1)
      expect(pricing.amountInCents).toBe(5532)
      expect(pricing.amountInUSD).toBe(55.32)
      expect(pricing.decimals).toBe(18)
      expect(pricing.symbol).toBe('$')
    })

    it('returns default usd pricing when "creditCard" settings price is not set', async () => {
      expect.assertions(4)

      const pricing = await pricingOperations.getDefaultUsdPricing({
        lockAddress: lockAddressWithoutSettings,
        network,
      })

      expect(pricing.decimals).toBe(6)
      expect(pricing.symbol).toBe('ETH')
      expect(pricing.amountInUSD).toBe(0.04)
      expect(pricing.amountInCents).toBe(4)
    })
  })

  describe('getUsdPricingForRecipient', () => {
    it('returns default usd pricing when "creditCard" settings price is not set', async () => {
      expect.assertions(4)
      const userAddress = await ethers.Wallet.createRandom().getAddress()
      const referrer = await ethers.Wallet.createRandom().getAddress()

      const pricing = await pricingOperations.getUsdPricingForRecipient({
        lockAddress: lockAddressWithoutSettings,
        network,
        userAddress,
        data: '0x',
        referrer,
      })
      expect(pricing.address).toBe(userAddress)
      expect(pricing.price.symbol).toBe('ETH')
      expect(pricing.price.amountInUSD).toBe(0.04)
      expect(pricing.price.amountInCents).toBe(4)
    })

    it('returns usd pricing with "creditCard" settings price', async () => {
      expect.assertions(6)
      const userAddress = await ethers.Wallet.createRandom().getAddress()
      const referrer = await ethers.Wallet.createRandom().getAddress()

      const pricing = await pricingOperations.getUsdPricingForRecipient({
        lockAddress: lockAddressWithSettings,
        network,
        userAddress,
        data: '0x',
        referrer,
      })
      expect(pricing.address).toBe(userAddress)
      expect(pricing.price.decimals).toBe(18)
      expect(pricing.price.symbol).toBe('$')
      expect(pricing.price.amountInUSD).toBe(55.32)
      expect(pricing.price.amountInCents).toBe(5532)
      expect(pricing.price.amount).toBe(1)
    })
  })

  describe('getPricingFromSettings', () => {
    it('returns null when pricing when "creditCardPrice" is not set in lockSettings', async () => {
      expect.assertions(1)

      const pricing = await pricingOperations.getPricingFromSettings({
        lockAddress: lockAddressErc20,
        network,
      })

      expect(pricing).toBe(null)
    })

    it('returns pricing when "creditCardPrice" is set in lockSettings', async () => {
      expect.assertions(4)

      const pricing = await pricingOperations.getPricingFromSettings({
        lockAddress,
        network,
      })

      expect(pricing?.decimals).toBe(18)
      expect(pricing?.symbol).toBe('$')
      expect(pricing?.amountInUSD).toBe(55.32)
      expect(pricing?.amountInCents).toBe(5532)
    })
  })
})
