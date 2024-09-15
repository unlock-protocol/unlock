import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { Web3Service, getErc20Decimals } from '@unlock-protocol/unlock-js'
import * as lockSettingOperations from './lockSettingOperations'
import { Currencies } from '@unlock-protocol/core'
import normalizer from '../utils/normalizer'
import { MemoryCache } from 'memory-cache-node'

interface DefiLamaResponse {
  price?: number
  symbol?: string
  timestamp?: number
  confidence?: number
  priceInAmount?: number
}

// Price is cached for 5 minutes
const pricingCacheDuration = 60 * 5
// We check values every minute
const defiLammaPriceCache = new MemoryCache<string, DefiLamaResponse>(
  pricingCacheDuration / 5,
  1000
)

interface Price {
  decimals: number
  symbol: string
  price: number
  timestamp: number
  confidence: number
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

interface KeyPricingPrice {
  amount: number
  decimals: number
  symbol: string | undefined
  amountInUSD: number | undefined
  amountInCents: number | undefined
}

export interface KeyPricing {
  price: KeyPricingPrice
  address?: string
}

interface PricingForRecipientProps {
  lockAddress: string
  network: number
  userAddress: string
  referrer: string
  data?: any
}

interface DefaultPricingProps {
  lockAddress: string
  network: number
}

export function fromDecimal(num: string, decimals: number) {
  return parseFloat(
    ethers.formatUnits(BigInt(num), decimals).replace(/\.0$/, '')
  )
}

export function getCurrencySymbol(currency?: string) {
  return (
    Currencies.find(
      (item) => item?.currency?.toLowerCase() === currency?.toLowerCase()
    )?.symbol ||
    currency?.toUpperCase() ||
    '$'
  )
}

/** Helper to return usd pricing object */
export const toUsdPricing = ({
  amount,
  usdPricing,
  decimals,
}: {
  amount: number
  decimals: number
  usdPricing: PriceResults
}): KeyPricingPrice => {
  const { symbol, price } = usdPricing ?? {}
  return {
    amount,
    decimals,
    symbol,
    amountInUSD: price ? amount * price : undefined,
    amountInCents: price ? Math.round(amount * price * 100) : 0,
  }
}

interface GetPriceProps {
  lockAddress: string
  network: number
  recipients?: string[]
}
/** Get pricing from settings  */
export const getPricingFromSettings = async ({
  lockAddress,
  network,
  recipients = [],
}: GetPriceProps): Promise<KeyPricingPrice | null> => {
  const { creditCardPrice, creditCardCurrency } =
    await lockSettingOperations.getSettings({
      lockAddress,
      network,
    })

  // return pricing object using the price from the settings
  if (creditCardPrice) {
    const keysToPurchase = recipients?.length || 1

    const amountInCents = creditCardPrice * keysToPurchase // this total is in basisPoints
    const amountInUSD = amountInCents / 100 // get total price in USD

    const symbol = getCurrencySymbol(creditCardCurrency)

    return {
      amount: amountInUSD, // amount is usd for the single key
      decimals: 18,
      symbol,
      amountInUSD,
      amountInCents,
    }
  }

  // no custom price is found
  return null
}

export async function getDefiLammaPriceNoCache({
  network,
  erc20Address,
}: Options): Promise<PriceResults> {
  if (!network) {
    return {}
  }
  const networkConfig = networks[network]
  const items: string[] = []
  const coingecko = `coingecko:${networkConfig.nativeCurrency?.coingecko}`
  const mainnetTokenAddress = networkConfig.tokens?.find(
    (item) =>
      normalizer.ethereumAddress(item.address) ===
      normalizer.ethereumAddress(erc20Address)
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

  return {
    ...item,
  }
}

export async function getDefiLammaPrice({
  network,
  erc20Address,
  amount = 1,
}: Options): Promise<PriceResults> {
  let pricing = defiLammaPriceCache.retrieveItemValue(
    `${erc20Address}@${network}`
  )
  if (!pricing) {
    pricing = await getDefiLammaPriceNoCache({
      network,
      erc20Address,
      amount,
    })
    defiLammaPriceCache.storeExpiringItem(
      `${erc20Address}@${network}`,
      pricing,
      pricingCacheDuration
    )
  }
  if (pricing.price) {
    return {
      ...pricing,
      priceInAmount: pricing.price * amount,
    }
  }
  return pricing
}

export async function getLockKeyPricing({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}) {
  const web3Service = new Web3Service(networks)
  const provider = web3Service.providerForNetwork(network)
  const lockContract = await web3Service.getLockContract(lockAddress, provider)
  const [keyPrice, currencyContractAddress] = await Promise.all([
    lockContract.keyPrice(),
    lockContract.tokenAddress(),
  ])
  const decimals =
    currencyContractAddress && currencyContractAddress !== ethers.ZeroAddress
      ? await getErc20Decimals(currencyContractAddress, provider)
      : networks[network].nativeCurrency?.decimals || 18

  return {
    decimals,
    keyPrice,
    currencyContractAddress,
  }
}

/** Get default pricing for a specific lock */
export const getDefaultUsdPricing = async ({
  lockAddress,
  network,
}: DefaultPricingProps): Promise<KeyPricingPrice> => {
  // retrieve pricing
  const [lockKeyPricing, pricingFromSettings] = await Promise.all([
    getLockKeyPricing({
      lockAddress,
      network,
    }),
    getPricingFromSettings({ lockAddress, network }),
  ])

  // priority to pricing from settings if present
  if (pricingFromSettings) {
    return pricingFromSettings
  }

  const { keyPrice, decimals, currencyContractAddress } = lockKeyPricing

  const usdPricing = await getDefiLammaPrice({
    network,
    erc20Address:
      !currencyContractAddress || currencyContractAddress === ethers.ZeroAddress
        ? undefined
        : currencyContractAddress,
  })

  const defaultPrice = fromDecimal(keyPrice, decimals)

  const defaultPricing = toUsdPricing({
    amount: defaultPrice,
    usdPricing,
    decimals,
  })

  return defaultPricing
}

/** Get usd pricing for a specific recipient */
export const getUsdPricingForRecipient = async ({
  lockAddress,
  network,
  userAddress,
  data,
  referrer,
}: PricingForRecipientProps): Promise<KeyPricing> => {
  const web3Service = new Web3Service(networks)
  const { decimals, currencyContractAddress } = await getLockKeyPricing({
    lockAddress,
    network,
  })

  const [usdPricing, pricingFromSettings] = await Promise.all([
    getDefiLammaPrice({
      network,
      erc20Address:
        !currencyContractAddress ||
        currencyContractAddress === ethers.ZeroAddress
          ? undefined
          : currencyContractAddress,
    }),
    getPricingFromSettings({ lockAddress, network }),
  ])

  // priority to pricing from settings if present
  if (pricingFromSettings) {
    return {
      address: userAddress,
      price: pricingFromSettings,
    }
  }

  const purchasePrice = await web3Service.purchasePriceFor({
    lockAddress,
    userAddress,
    data,
    network,
    referrer: referrer || networks[network]?.multisig || userAddress,
  })

  const amount = fromDecimal(purchasePrice, decimals)

  const price = toUsdPricing({
    amount,
    usdPricing,
    decimals,
  })

  return {
    address: userAddress,
    price,
  }
}
