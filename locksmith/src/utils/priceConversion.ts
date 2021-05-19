const coinbase = require('coinbase')

export default class PriceConversion {
  client: any

  constructor() {
    this.client = new coinbase.Client({
      apiKey: ' ',
      apiSecret: ' ',
      // https://stackoverflow.com/questions/60735849/unable-to-get-issuer-cert-locally-error-when-calling-the-coinbase-nodejs-api
      strictSSL: false,
    })
  }

  conversionRates(currency: string) {
    return new Promise((resolve, reject) => {
      this.client.getExchangeRates(
        {
          currency: currency,
        },
        (error: any, results: any) => {
          if (error) return reject(error)
          resolve(results.data.rates)
        }
      )
    })
  }

  async convertToUSD(currency: string, amount: number) {
    const rates: any = await this.conversionRates(currency)
    const usdRate = rates.USD
    return Math.ceil(parseFloat(usdRate) * amount * 100)
  }
}
