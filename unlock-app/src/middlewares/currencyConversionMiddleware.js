import { setConversionRate } from '../actions/currencyconvert'
import axios from 'axios'

export default store => {
  setInterval(() => {
    axios.get('https://api.coinbase.com/v2/prices/ETH-USD/buy')
      .then(info => store.dispatch(setConversionRate(info.data.currency, info.data.amount)))
  }, 10000)
  return next => action => next(action)
}