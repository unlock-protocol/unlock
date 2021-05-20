import PriceConversion from '../../src/utils/priceConversion'

const coinbase = require('coinbase')

jest.genMockFromModule('coinbase')
jest.mock('coinbase')

const mockCB = {
  getExchangeRates: jest
    .fn()
    .mockImplementationOnce((_, callback) =>
      callback(null, { data: { rates: { USD: '100.00' } } })
    )
    .mockImplementationOnce((_, callback) =>
      callback(new Error('Invalid Currency'))
    )
    .mockImplementationOnce((_, callback) =>
      callback(null, { data: { rates: { USD: '100.00' } } })
    )
    .mockImplementationOnce((_, callback) =>
      callback(new Error('Invalid Currency'))
    ),
}

coinbase.Client.mockImplementation(() => mockCB)
const pc = new PriceConversion()

describe('PriceConversion', () => {
  describe('conversionRates', () => {
    describe('when able to retrieve exchange rates', () => {
      it('returns a collection of exchange rates for the requested currency', async () => {
        expect.assertions(1)
        expect(await pc.conversionRates('ETH')).toHaveProperty('USD')
      })
    })

    describe('when unable to retrieve exchange rates', () => {
      it('raises an error', async () => {
        expect.assertions(1)
        await expect(pc.conversionRates('BBB')).rejects.toThrow()
      })
    })
  })

  describe('convertToUSD', () => {
    describe('when exchange rate is available for conversion', () => {
      it('return the requested price in USD', async () => {
        expect.assertions(1)
        const rate = await pc.convertToUSD('ETH', 0.5)
        expect(rate).toEqual(5000) // price in cents!
      })
    })

    describe('when exchange rate is unavailable for conversion', () => {
      it('raises an error', async () => {
        expect.assertions(1)
        await expect(pc.convertToUSD('xxx', 0.25)).rejects.toThrow()
      })
    })
  })
})
