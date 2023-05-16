import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { getFees, getGasCost } from '../utils/pricing'
import * as lockSettingOperations from './lockSettingOperations'
import { MIN_PAYMENT_STRIPE } from '../utils/constants'
import { getCreditCardEnabledStatus } from './creditCardOperations'

interface Price {
  decimals: number
  symbol: string
  price: number
  timestamp: number
  confidence: number
  creditCardEnabled: boolean
}

export interface LockPricingValues {
  total: number
  subtotal: number
  gasCost: number
  unlockServiceFee: number
  creditCardProcessingFee: number
  isCreditCardPurchasable: boolean
}

export interface LockPricingProps {
  amount?: number
  address?: string
  lockAddress?: string
  keysToPurchase?: number
  network: number
}

export type PriceResults = Partial<
  Price & {
    priceInAmount: number
  }
>

export async function getDefiLammaPrice({
  network,
  address,
  amount = 1,
}: Omit<LockPricingProps, 'lockAddress'>): Promise<PriceResults> {
  const networkConfig = networks[network]

  if (!network) {
    return {}
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
 * Get lock pricing with priority to credit card total if present
 * @returns
 */
export async function getUsdPricingForLock({
  lockAddress,
  network,
  address,
  amount = 1,
  keysToPurchase = 1,
}: LockPricingProps): Promise<PriceResults> {
  const web3Service = new Web3Service(networks)
  // priority to credit card if present settings is present
  if (lockAddress) {
    const { creditCardPrice } = await lockSettingOperations.getSettings({
      lockAddress,
      network,
    })

    if (creditCardPrice) {
      const creditCardEnabled = await getCreditCardEnabledStatus({
        lockAddress,
        network,
        totalPriceInCents: creditCardPrice ?? 0,
      })

      const lock = await web3Service.getLock(lockAddress, network)

      const symbol =
        lock?.currencySymbol || networks?.[network]?.nativeCurrency?.symbol

      const price = lock?.keyPrice

      return {
        price,
        symbol,
        creditCardEnabled,
        decimals: 18,
        confidence: 1,
        timestamp: new Date().getTime(),
        priceInAmount: creditCardPrice * keysToPurchase,
      }
    }
  }

  // fallback to converted price
  const result = await getDefiLammaPrice({
    network,
    address,
    amount,
  })

  return result
}

/**
 * Get lock total charges with fees
 * @returns
 */
export const getTotalCharges = async ({
  lockAddress,
  network,
  address,
  amount = 1,
  keysToPurchase = 1,
}: LockPricingProps): Promise<LockPricingValues> => {
  const [pricing, gasCost] = await Promise.all([
    getUsdPricingForLock({
      network,
      amount,
      address,
      lockAddress,
      keysToPurchase,
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
  const subtotal = Math.round(pricing.priceInAmount! * 100)

  const fees = getFees({
    subtotal,
    gasCost,
  })

  const result = {
    ...fees,
    subtotal,
    isCreditCardPurchasable: subtotal > MIN_PAYMENT_STRIPE,
  }

  return result
}
