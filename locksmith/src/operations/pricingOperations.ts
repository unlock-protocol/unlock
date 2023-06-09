import networks from '@unlock-protocol/networks'
import { getFees, getGasCost } from '../utils/pricing'
import { MIN_PAYMENT_STRIPE_CREDIT_CARD } from '../utils/constants'

interface Price {
  decimals: number
  symbol: string
  price: number
  timestamp: number
  confidence: number
  creditCardEnabled: boolean
}

export interface Options {
  amount?: number
  erc20Address?: string
  network: number
}

export type PriceResults = Partial<
  Price & {
    priceInAmount: number
  }
>

export async function getDefiLammaPrice({
  network,
  erc20Address,
  amount = 1,
}: Options): Promise<PriceResults> {
  const networkConfig = networks[network]
  if (!network) {
    return {}
  }
  const items: string[] = []
  const coingecko = `coingecko:${networkConfig.nativeCurrency?.coingecko}`
  const mainnetTokenAddress = networkConfig.tokens?.find(
    (item) => item.address?.toLowerCase() === erc20Address?.toLowerCase()
  )?.mainnetAddress

  if (mainnetTokenAddress) {
    items.push(`ethereum:${mainnetTokenAddress}`)
  }

  if (erc20Address) {
    items.push(`${networkConfig.chain}:${erc20Address}`)
  }

  if (!erc20Address && coingecko) {
    items.push(coingecko)
  }

  const endpoint = `https://coins.llama.fi/prices/current/${items.join(',')}`
  const response = await fetch(endpoint)

  if (!response.ok) {
    return {}
  }

  const json: Record<'coins', Record<string, Price>> = await response.json()
  const item = Object.values(json.coins).filter(
    (item) => item.confidence > 0.95
  )[0]

  if (!item) {
    return {}
  }

  const priceInAmount = item.price * amount

  return {
    ...item,
    priceInAmount,
  }
}

/**
 * Get lock total charges with fees
 * @returns
 */
export const getTotalCharges = async ({
  amount,
  network,
  erc20Address,
}: Options) => {
  const [pricing, gasCost] = await Promise.all([
    getDefiLammaPrice({
      network,
      amount,
      erc20Address,
    }),
    getGasCost({ network }),
  ])

  if (pricing.priceInAmount === undefined) {
    return {
      total: 0,
      subtotal: 0,
      gasCost,
      unlockServiceFee: 0,
      creditCardProcessingFee: 0,
      isCreditCardPurchasable: false,
    }
  }
  const subtotal = Math.round(pricing.priceInAmount * 100)
  const fees = getFees({
    subtotal,
    gasCost,
  })
  const result = {
    ...fees,
    subtotal,
    isCreditCardPurchasable: fees.total > MIN_PAYMENT_STRIPE_CREDIT_CARD,
  }
  return result
}
