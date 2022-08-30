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
   * @param lockPriceAmount in cents
   * @returns
   */
  async convertToUSD(currency: string, lockPriceAmount: number) {
    const cached = cache[currency]

    let rate
    // Cache is valid for 5 minutes!
    if (cached && cached[0] > new Date().getTime() - 1000 * 60 * 5) {
      ;[, rate] = cached
      return parseInt((cached[1] * lockPriceAmount * 100).toFixed(0))
    } else {
      const response = await fetch(
        `https://api.coinbase.com/v2/prices/${currency}-USD/buy`
      )

      if (!response.ok) {
        return null
      }

      const { data } = await response.json()
      const amount = data?.amount

      if (!amount) {
        return null
      }

      cache[currency] = [new Date().getTime(), parseFloat(amount)]
      rate = parseFloat(amount)
    }

    return parseInt((rate * lockPriceAmount * 100).toFixed(0))
  }
}
