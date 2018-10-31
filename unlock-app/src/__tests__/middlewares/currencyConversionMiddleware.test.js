import mockAxios from 'jest-mock-axios'
import { setConversionRate } from '../../actions/currencyconvert'

afterEach(() => mockAxios.reset())

describe('Currency conversion service retrieval middleware', () => {
  test('service called, action dispatched to set currency conversion rate', () => {
    jest.useFakeTimers()
    const middleware = require('../../middlewares/currencyConversionMiddleware').default
    const store = {
      dispatch: jest.fn()
    }

    middleware(store)
    jest.advanceTimersByTime(10000)
    expect(mockAxios.get).toHaveBeenCalledWith('https://api.coinbase.com/v2/prices/ETH-USD/buy')
    mockAxios.mockResponse({"data":{"base":"ETH","currency":"USD","amount":"195.99"}})

    expect(store.dispatch).toHaveBeenCalledWith(setConversionRate('USD', '195.99'))
  })
})