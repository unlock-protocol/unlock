// TODO convert to fetch instead of using axios when it is supported well enough
/* eslint promise/prefer-await-to-then: 0 */

import axios from 'axios'
import { setConversionRate } from '../actions/currencyConvert'
import configure from '../config'

const { services } = configure(global)
const currencyPriceLookupURI = services.currencyPriceLookup

export default store => {
  axios
    .get(currencyPriceLookupURI)
    .then(info =>
      store.dispatch(
        setConversionRate(info.data.data.currency, info.data.data.amount)
      )
    )
  setInterval(() => {
    axios.get(currencyPriceLookupURI).then(info => {
      const {
        data: {
          data: { currency, amount },
        },
      } = info
      const current = store.getState().currency[currency]
      if (current === +amount) return

      store.dispatch(setConversionRate(currency, amount))
    })
  }, 10000)
  return next => action => next(action)
}
