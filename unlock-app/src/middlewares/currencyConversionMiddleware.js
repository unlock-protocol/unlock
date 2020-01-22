/* eslint promise/prefer-await-to-then: 0 */

import { setConversionRate } from '../actions/currencyConvert'
import CurrencyLookupService from '../services/currencyLookupService'

export default config => {
  const { services } = config
  const currencyPriceLookupURI = services.currencyPriceLookup
  return store => {
    const currencyLookupService = new CurrencyLookupService(
      currencyPriceLookupURI
    )

    currencyLookupService
      .lookupPrice('ETH', 'USD')
      .then(info =>
        store.dispatch(setConversionRate(info.currency, info.amount))
      )

    return next => action => next(action)
  }
}
