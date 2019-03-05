/* eslint promise/prefer-await-to-then: 0 */

import { setConversionRate } from '../actions/currencyConvert'
import configure from '../config'
import CurrencyLookupService from '../services/currencyLookupService'
import { CURRENCY_CONVERSION_MIDDLEWARE_RETRY_INTERVAL } from '../constants'

const { services } = configure(global)
const currencyPriceLookupURI = services.currencyPriceLookup

export default store => {
  const currencyLookupService = new CurrencyLookupService(
    currencyPriceLookupURI
  )

  currencyLookupService
    .lookupPrice('ETH', 'USD')
    .then(info => store.dispatch(setConversionRate(info.currency, info.amount)))

  setInterval(() => {
    currencyLookupService.lookupPrice('ETH', 'USD').then(info => {
      const current = store.getState().currency[info.currency]
      if (current === info.amount) return

      store.dispatch(setConversionRate(info.currency, info.amount))
    })
  }, CURRENCY_CONVERSION_MIDDLEWARE_RETRY_INTERVAL)
  return next => action => next(action)
}
