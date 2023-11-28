const { getNetwork } = require('./unlock')

const getTokens = async () => {
  const { tokens: tokensList } = await getNetwork()
  const tokens = tokensList.reduce((prev, { symbol, address }) => {
    prev[symbol] = address
    return prev
  }, {})
}

// fetch wrapped token USD price
const fetchPriceInUSD = async (symbol = 'ETH') => {
  console.log(`Fetching ${symbol} price...`)
  const response = await fetch(
    `https://api.coinbase.com/v2/prices/${symbol}-USD/buy`
  )
  console.log(response)

  if (!response.ok) {
    throw new Error(`USD price not available on coinbase`)
  }

  const { data } = await response.json()
  return data.amount
}

export default {
  getTokens,
  fetchPriceInUSD,
}
