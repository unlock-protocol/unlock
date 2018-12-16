import mockAxios from 'jest-mock-axios'
import { setConversionRate } from '../../actions/currencyconvert'

afterEach(() => mockAxios.reset())

describe('Currency conversion service retrieval middleware', () => {
  const response1 = {
    data: { base: 'ETH', currency: 'USD', amount: '195.99' },
  }
  const response2 = {
    data: { base: 'ETH', currency: 'USD', amount: '198.20' },
  }
  const APIaddress = 'https://api.coinbase.com/v2/prices/ETH-USD/buy'

  it('service called, action dispatched to set currency conversion rate', () => {
    jest.useFakeTimers()
    const middleware = require('../../middlewares/currencyConversionMiddleware')
      .default
    const store = {
      dispatch: jest.fn(),
      getState() {
        return { currency: { USD: 1 } }
      },
    }

    middleware(store)

    expect(mockAxios.get).toHaveBeenCalledWith(APIaddress)
    mockAxios.mockResponse({ data: response1 })
    expect(store.dispatch).toHaveBeenCalledWith(
      setConversionRate('USD', '195.99')
    )

    store.dispatch = jest.fn() // reset
    mockAxios.reset()

    jest.advanceTimersByTime(10000) // test the setInterval

    expect(mockAxios.get).toHaveBeenCalledWith(APIaddress)
    mockAxios.mockResponse({ data: response2 })

    expect(store.dispatch).toHaveBeenCalledWith(
      setConversionRate('USD', '198.20')
    )
  })
  it('service called, values are the same, so don\'t dispatch', () => {
    jest.useFakeTimers()
    const middleware = require('../../middlewares/currencyConversionMiddleware')
      .default
    const store = {
      dispatch: jest.fn(),
    }

    middleware(store)
    store.dispatch = jest.fn() // reset
    store.getState = () => ({ currency: { USD: 195.99 } })

    mockAxios.reset()

    jest.advanceTimersByTime(10000) // test the setInterval

    expect(mockAxios.get).toHaveBeenCalledWith(APIaddress)
    mockAxios.mockResponse({ data: response1 })

    expect(store.dispatch).not.toHaveBeenCalled()
  })
})
