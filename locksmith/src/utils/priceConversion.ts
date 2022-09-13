import fetch from 'isomorphic-fetch'
import BigNumber from 'bignumber.js'

interface PricesCache {
  [currency: string]: [timestamp: number, price: BigNumber]
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
      return cached[1]
        .multipliedBy(lockPriceAmount)
        .multipliedBy(100)
        .toNumber()
    } else {
      const response = await fetch(
        `https://api.coinbase.com/v2/prices/${currency}-USD/buy`
      )

      if (!response.ok) {
        throw new Error(`USD price not available on coinbase`)
      }

      const { data } = await response.json()
      const amount = data?.amount

      if (!amount) {
        throw new Error('Amount is invalid')
      }
      // BigNumber.js is used instead of ether.BigNumber due to lack of support for decimals.
      rate = new BigNumber(amount)
      cache[currency] = [new Date().getTime(), rate]
    }

    const price = rate
      .multipliedBy(lockPriceAmount)
      .multipliedBy(100)
      .toNumber()

    return price
  }
}
