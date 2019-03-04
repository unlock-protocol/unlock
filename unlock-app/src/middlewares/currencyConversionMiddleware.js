// TODO convert to fetch instead of using axios when it is supported well enough
/* eslint promise/prefer-await-to-then: 0 */

import { setConversionRate } from '../actions/currencyConvert'
import configure from '../config'
import CurrencyLookupService from '../services/currencyLookupService'

const { services } = configure(global)
const currencyPriceLookupURI = services.currencyPriceLookup
const retryInterval = 10000

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
  }, retryInterval)
  return next => action => next(action)
}
