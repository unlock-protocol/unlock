import { setConversionRate } from '../../actions/currencyConvert'
import configure from '../../config'

jest.mock('../../services/currencyLookupService', () => {
  return function currencyLookupService() {
    return {
      lookupPrice: jest
        .fn()
        .mockResolvedValueOnce({ currency: 'USD', amount: '195.99' }),
    }
  }
})

describe('Currency conversion service retrieval middleware', () => {
  it('service called, action dispatched to set currency conversion rate', async () => {
    expect.assertions(1)
    const config = configure()
    const middleware = require('../../middlewares/currencyConversionMiddleware')
      .default
    const store = {
      dispatch: jest.fn(),
      getState() {
        return { currency: { USD: 1 } }
      },
    }

    await middleware(config)(store)

    expect(store.dispatch).toHaveBeenCalledWith(
      setConversionRate('USD', '195.99')
    )
  })

  it("service called, values are the same, so don't dispatch", async () => {
    expect.assertions(1)
    jest.useFakeTimers()
    const config = configure()
    const middleware = require('../../middlewares/currencyConversionMiddleware')
      .default
    const store = {
      dispatch: jest.fn(),
    }

    await middleware(config)(store)
    store.dispatch = jest.fn() // reset
    store.getState = () => ({ currency: { USD: 195.99 } })
    jest.advanceTimersByTime(10000) // test the setInterval
    expect(store.dispatch).not.toHaveBeenCalled()
  })
})
