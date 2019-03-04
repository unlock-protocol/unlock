import mockAxios from 'jest-mock-axios'
import CurrencyLookupService from '../../services/currencyLookupService'

describe('CurrencyLookupService', () => {
  let currencyLookupService = new CurrencyLookupService(
    'https://api.coinbase.com/foo/bar/baz'
  )

  describe('_constructCoinbaseLookupURI', () => {
    it('generates the appropriate API end point for the given base and currency', () => {
      expect.assertions(1)
      expect(
        currencyLookupService._constructCoinbaseLookupURI('ETC', 'GBP')
      ).toEqual('https://api.coinbase.com/v2/prices/ETC-GBP/buy')
    })
  })

  describe('lookupPrice', () => {
    describe('when confifgured for coinbase', () => {
      it('will dispatch to coinbase for the data', () => {
        expect.assertions(1)
        currencyLookupService._handleCoinbaseFetch = jest.fn()
        currencyLookupService.lookupPrice('ETH', 'GBP')
        expect(currencyLookupService._handleCoinbaseFetch).toBeCalledWith(
          'ETH',
          'GBP'
        )
      })
    })
    describe('when configured for anything that isnt coinbase', () => {
      it('return a rejected promise', () => {
        expect.assertions(1)
        currencyLookupService = new CurrencyLookupService(
          'https://somelocksmithinstallation'
        )

        expect(currencyLookupService.lookupPrice('ETC', 'GBP')).rejects.toMatch(
          ''
        )
      })
    })
  })

  describe('_handleCoinbaseFetch', () => {
    it('requests the pricing pair for coinbase', () => {
      expect.assertions(1)
      currencyLookupService._handleCoinbaseFetch('ETH', 'USD')
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://api.coinbase.com/v2/prices/ETH-USD/buy'
      )
    })
  })
})
