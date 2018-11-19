import {
  setConversionRate,
  SET_ETHER_CONVERSION_RATE,
} from '../../actions/currencyconvert'

describe('currency conversion actions', () => {
  it('should create an action to set a currency conversion rate for USD', () => {
    const rateFor1Eth = '195.99'
    const convertedRate = 195.99
    const currency = 'USD'
    const expectedAction = {
      type: SET_ETHER_CONVERSION_RATE,
      rateFor1Eth: convertedRate,
      currency,
    }
    expect(setConversionRate(currency, rateFor1Eth)).toEqual(expectedAction)
  })

  it('should create an action to set a currency conversion rate for EUR', () => {
    const rateFor1Eth = '200.30'
    const convertedRate = 200.3
    const currency = 'EUR'
    const expectedAction = {
      type: SET_ETHER_CONVERSION_RATE,
      rateFor1Eth: convertedRate,
      currency,
    }
    expect(setConversionRate(currency, rateFor1Eth)).toEqual(expectedAction)
  })
})
