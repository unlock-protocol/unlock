import fetch from 'isomorphic-fetch'

interface PricesCache {
  [currency: string]: [timestamp: number, price: number]
}

const cache: PricesCache = {}

export default class PriceConversion {
  client: any

  /**
   * Returns the USD cents price of a currency amount
   * @param currency
   * @param amount in cents
   * @returns
   */
  async convertToUSD(currency: string, amount: number) {
    const cached = cache[currency]

    let rate
    // Cache is valid for 5 minutes!
    if (cached && cached[0] > new Date().getTime() - 1000 * 60 * 5) {
      ;[, rate] = cached
      return parseInt((cached[1] * amount * 100).toFixed(0))
    } else {
      const response = await fetch(
        `https://api.coinbase.com/v2/prices/${currency}-USD/buy`
      )

      if (!response.ok) {
        return undefined
      }

      const { data } = await response.json()

      cache[currency] = [new Date().getTime(), parseFloat(data.amount)]
      rate = parseFloat(data.amount)
    }

    return parseInt((rate * amount * 100).toFixed(0))
  }
}
