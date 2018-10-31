import { setConversionRate } from '../actions/currencyconvert'
import axios from 'axios'

export default store => {
  axios.get('https://api.coinbase.com/v2/prices/ETH-USD/buy')
    .then(info => store.dispatch(setConversionRate(info.data.data.currency, info.data.data.amount)))
  setInterval(() => {
    axios.get('https://api.coinbase.com/v2/prices/ETH-USD/buy')
      .then(info => {
        const { data: { data: { currency, amount }}} = info
        const current = store.getState().currency[currency]
        if (current === +amount) return

        store.dispatch(setConversionRate(currency, amount))
      })
  }, 10000)
  return next => action => next(action)
}