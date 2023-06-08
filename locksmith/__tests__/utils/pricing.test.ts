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
    getLockKeyPricing: vi.fn(() =>
      Promise.resolve({
        decimals: 18,
        keyPrice: 1000,
        currencyContractAddress: '0xb93cba7013f4557cdfb590fd152d24ef4063485f',
      })
    ),
  }
})

vi.mock('../../src/operations/lockSettingOperations', () => {
  return {
    getSettings: ({ lockAddress: lock }) => {
      let res: any = DEFAULT_LOCK_SETTINGS
      if (lock === lockAddressCreditCardSetting) {
        res = {
          creditCardPrice,
        }
      }
      return Promise.resolve(res)
    },
  }
})

vi.mock('../../src/operations/pricingOperations', () => {
  return {
    getDefiLammaPrice: vi.fn(() =>
      Promise.resolve({
        amount: 1,
        price: 88,
        decimals: 18,
        symbol: 'MATIC',
      })
    ),
  }
})

describe('getLockUsdPricing', () => {
  // TODO: Test timed out in 300000ms need to check the reason why even if we have mocks
  it.skip('returns USD price from credit card setting price', async () => {
    expect.assertions(3)

    const usdPricing = await getLockUsdPricing({
      lockAddress: lockAddressCreditCardSetting,
      network,
    })

    expect(usdPricing.symbol).toBe('$')
    expect(usdPricing.price).toBe(17)
    expect(usdPricing.isPriceFromSettings).toBe(true)
  })

  // TODO: Test timed out in 300000ms need to check the reason why even if we have mocks
  it.skip('returns USD price from conversion', async () => {
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
