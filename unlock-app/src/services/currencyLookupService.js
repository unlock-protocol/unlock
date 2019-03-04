import axios from 'axios'

export default class CurrencyLookupService {
  constructor(uri) {
    this.host = new URL(uri).host
  }

  async lookupPrice(base, currency) {
    if (RegExp('api.coinbase.com', 'ig').test(this.host)) {
      return this._handleCoinbaseFetch(base, currency)
    } else {
      throw 'Unknown Currency Conversion Provider'
    }
  }

  _constructCoinbaseLookupURI(base, currency) {
    return `https://api.coinbase.com/v2/prices/${base.toUpperCase()}-${currency.toUpperCase()}/buy`
  }

  async _handleCoinbaseFetch(base, currency) {
    let result = await axios.get(
      this._constructCoinbaseLookupURI(base, currency)
    )

    return Promise.resolve({
      currency: result.data.data.currency,
      amount: result.data.data.amount,
    })
  }
}
