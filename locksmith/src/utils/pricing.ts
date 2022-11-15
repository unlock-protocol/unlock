import { networks } from '@unlock-protocol/networks'

export interface Options {
  amount?: number
  address?: string
  network: number
}

interface Price {
  decimals: 8
  symbol: 'HUSD'
  price: 0.159081
  timestamp: 1668520378
  confidence: 0.99
}

export async function defiLammaPrice({ network, address, amount }: Options) {
  const networkConfig = networks[network]
  if (!network) {
    throw new Error(`No network found with id: ${network}`)
  }
  const items: string[] = []
  const coingecko = `coingecko:${networkConfig.nativeCurrency?.coingecko}`
  const mainnetTokenAddress = networkConfig.tokens?.find(
    (item) => item.address?.toLowerCase() === address?.toLowerCase()
  )?.mainnetAddress

  if (mainnetTokenAddress) {
    items.push(`ethereum:${mainnetTokenAddress}`)
  }

  if (address) {
    items.push(`${networkConfig.chain}:${address}`)
  }

  if (!address && coingecko) {
    items.push(coingecko)
  }

  const endpoint = `https://coins.llama.fi/prices/current/${items.join(',')}`
  const response = await fetch(endpoint)

  if (!response.ok) {
    throw new Error('Error in fetching price.')
  }

  const json: Record<'coins', Record<string, Price>> = await response.json()
  const item = Object.values(json.coins).filter(
    (item) => item.confidence > 0.95
  )[0]

  if (!item) {
    throw new Error('No price found for the query')
  }

  return {
    ...item,
    priceInAmount: item.price * (amount || 1),
  }
}
