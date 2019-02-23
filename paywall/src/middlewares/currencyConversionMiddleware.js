// TODO convert to fetch instead of using axios when it is supported well enough
/* eslint promise/prefer-await-to-then: 0 */

import axios from 'axios'

import { setConversionRate } from '../actions/currencyConvert'
import pollWithConditions from '../utils/polling'
import configure from '../config'

const config = configure()

export default store => {
  axios
    .get('https://api.coinbase.com/v2/prices/ETH-USD/buy')
    .then(info =>
      store.dispatch(
        setConversionRate(info.data.data.currency, info.data.data.amount)
      )
    )
  pollWithConditions(
    () => {
      axios.get('https://api.coinbase.com/v2/prices/ETH-USD/buy').then(info => {
        const {
          data: {
            data: { currency, amount },
          },
        } = info
        const current = store.getState().currency[currency]
        if (current === +amount) return

        store.dispatch(setConversionRate(currency, amount))
      })
    },
    10000,
    () => {
      if (config.isServer) {
        throw new Error('currency conversion polling is only on the client')
      }
      // temporarily stop polling when offline
      return !window.navigator.isOnline
    }
  )
  return next => action => next(action)
}
