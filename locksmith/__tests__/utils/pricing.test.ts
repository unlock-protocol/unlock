import { vi, describe, expect } from 'vitest'
import { getLockUsdPricing } from '../../src/utils/pricing'
import { DEFAULT_LOCK_SETTINGS } from '../../src/controllers/v2/lockSettingController'

const defaultLockAddress = '0x4a4dfcb41cd0184fdab091e638ec072173c8dc1c'
const lockAddressCreditCardSetting =
  '0x9405880e66972094fd95153b2afbcb0a865a9bbb'
const network = 5
const creditCardPrice = 1700 // $17 usd in cents

vi.mock('../../src/utils/pricing', async () => {
  const actual: any = await vi.importActual('../../src/utils/pricing')
  return {
    ...actual,
    getLockKeyPricing: async () => ({
      decimals: 18,
      keyPrice: 1000,
      currencyContractAddress: '0xb93cba7013f4557cdfb590fd152d24ef4063485f',
    }),
  }
})

vi.mock('../../src/operations/lockSettingOperations', () => {
  return {
    getSettings: async ({ lockAddress: lock }) => {
      if (lock === lockAddressCreditCardSetting) {
        return {
          creditCardPrice,
        }
      }
      return DEFAULT_LOCK_SETTINGS
    },
  }
})

vi.mock('../../src/operations/pricingOperations', () => {
  return {
    getDefiLammaPrice: async ({ _network, _erc20Address, _amount }) => {
      return {
        amount: 1,
        price: 88,
        decimals: 18,
        symbol: 'MATIC',
      }
    },
  }
})

describe('getLockUsdPricing', () => {
  it('returns USD price from credit card setting price', async () => {
    expect.assertions(3)

    const usdPricing = await getLockUsdPricing({
      lockAddress: lockAddressCreditCardSetting,
      network,
    })

    expect(usdPricing.symbol).toBe('$')
    expect(usdPricing.price).toBe(17)
    expect(usdPricing.isPriceFromSettings).toBe(true)
  })

  it('returns USD price from conversion', async () => {
    expect.assertions(3)
    const usdPricing = await getLockUsdPricing({
      lockAddress: defaultLockAddress,
      network,
    })

    expect(usdPricing.symbol).toBe('MATIC')
    expect(usdPricing.price).toBe(88)
    expect(usdPricing.isPriceFromSettings).toBe(undefined)
  })
})
