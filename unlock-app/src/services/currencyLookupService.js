import axios from 'axios'

const URL = require('url')

/**
 *  Provides currency lookup abstraction for down stream consumers.
 */
export default class CurrencyLookupService {
  constructor(uri) {
    this.host = URL.parse(uri).host
  }

  /**
   *  Based upon the currently configured host fot the object, will provide
   * information regarding the provided base and currency.
   *
   * @param {*} base
   * @param {*} currency
   */
  async lookupPrice(base, currency) {
    if (RegExp('api.coinbase.com', 'ig').test(this.host)) {
      return this._handleCoinbaseFetch(base, currency)
    } else {
      throw 'Unknown Currency Conversion Provider'
    }
  }

  /**
   * Returns the appropriate API request to be utilized when requesting
   * currency information from Coinbase's API
   *
   * @param {String} base
   * @param {String} currency
   *
   * @returns {String}
   */
  _constructCoinbaseLookupURI(base, currency) {
    return `https://api.coinbase.com/v2/prices/${base.toUpperCase()}-${currency.toUpperCase()}/buy`
  }

  /**
   *  Requests currency information from Coinbase and package consistently
   * for consumers.
   *
   * @param {String} base
   * @param {String} currency
   */
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
