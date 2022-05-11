import fetch from 'isomorphic-fetch'

interface PricesCache {
  [currency: string]: [timestamp: number, price: number]
}

const cache: PricesCache = {}

export default class PriceConversion {
  client: any

  // Returns the price in $
  async convertToUSD(currency: string, amount: number) {
    const cached = cache[currency]

    // Cache is valid for 5 minutes!
    if (cached && cached[0] > new Date().getTime() - 1000 * 60 * 5) {
      return (cached[1] * amount * 100).toFixed(2)
    }

    const response = await fetch(
      `https://api.coinbase.com/v2/prices/${currency}-USD/buy`
    )

    const { data } = await response.json()
    if (!data?.amount) {
      return 0
    }
    cache[currency] = [new Date().getTime(), parseFloat(data.amount)]
    return (parseFloat(data.amount) * amount * 100).toFixed(2)
  }
}
