import PriceConversion from '../../src/utils/priceConversion'

jest.mock('isomorphic-fetch', () => {
  return jest.fn(() => {
    return {
      ok: true,
      json() {
        return {
          data: {
            amount: '0.01',
          },
        }
      },
    }
  })
})

describe('PriceConversion', () => {
  describe('when the lock currency has an exchange rate on coinbase', () => {
    it('returns the key price in USD', async () => {
      expect.assertions(1)
      const pricer = new PriceConversion()
      const price = await pricer.convertToUSD('USDC', 1)
      expect(price).toBe(1)
    })
  })
})
