import fetch from 'cross-fetch'

export async function getCoinbasePricing(currency, value) {
  const endpoint = `https://api.coinbase.com/v2/prices/${currency.toUpperCase()}-USD/buy`
  const response = await fetch(endpoint)
  const { data } = await response.json()
  const amount = data?.amount
  if (!amount) {
    return 0
  }
  return parseInt(amount * value, 10)
}
