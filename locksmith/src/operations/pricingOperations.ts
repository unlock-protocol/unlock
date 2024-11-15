import networks from '@unlock-protocol/networks'
import { ethers } from 'ethers'
import { getErc20Decimals } from '@unlock-protocol/unlock-js'
import * as lockSettingOperations from './lockSettingOperations'
import { Currencies } from '@unlock-protocol/core'
import normalizer from '../utils/normalizer'
import { MemoryCache } from 'memory-cache-node'
import { getWeb3Service } from '../initializers'

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

// Represent the price for a single key, in fiat
export interface KeyFiatPricingPrice {
  amount: number
  decimals: number
  currency: string
}

export interface KeyPricing {
  price: KeyFiatPricingPrice
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

interface GetPriceProps {
  lockAddress: string
  network: number
  recipients?: string[]
}

/** Get pricing from settings  */
// Returns {currency, amount, decimals} if a custom price is set
export const getKeyPricingFromSettings = async ({
  lockAddress,
  network,
}: GetPriceProps): Promise<KeyFiatPricingPrice | null> => {
  const { creditCardPrice, creditCardCurrency } =
    await lockSettingOperations.getSettings({
      lockAddress,
      network,
    })

  // return pricing object using the price from the settings
  if (creditCardPrice) {
    return {
      currency: creditCardCurrency || 'usd', // defaults to usd
      amount: creditCardPrice / 100.0, // the amount stored in the db is in cents!
      decimals: 0,
    }
  }

  // no custom price is found
  return null
}

export async function getDefiLlamaPriceNoCache({
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
    symbol: '$', // defilama always returns USD
  }
}

export async function getDefiLlamaPrice({
  network,
  erc20Address,
  amount = 1,
}: Options): Promise<PriceResults> {
  let pricing = defiLammaPriceCache.retrieveItemValue(
    `${erc20Address}@${network}`
  )
  if (!pricing) {
    pricing = await getDefiLlamaPriceNoCache({
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

// Returns the default keyPrice fron the lock (not specific to any recipient!)
export async function getLockKeyPricingFromContract({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}) {
  const web3Service = getWeb3Service()
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

/** Get the pricing that applies to any recipient for a specific lock,
 * either because a price is set in the settings, or by getting the price
 * from the `keyPrice` method on the lock. */
export const getDefaultFiatPricing = async ({
  lockAddress,
  network,
}: DefaultPricingProps): Promise<KeyFiatPricingPrice | undefined> => {
  // retrieve pricings, both from the chain and from the settings, if set
  const [lockKeyPricing, pricingFromSettings] = await Promise.all([
    getLockKeyPricingFromContract({
      lockAddress,
      network,
    }),
    getKeyPricingFromSettings({ lockAddress, network }),
  ])

  // priority to pricing from settings if present
  if (pricingFromSettings) {
    return pricingFromSettings
  }

  // If none is set, we will use the default pricing from the chain, and convert to USD
  const { keyPrice, decimals, currencyContractAddress } = lockKeyPricing

  const amountInCrypto = fromDecimal(keyPrice, decimals)
  const usdExchangeRate = await getDefiLlamaPrice({
    network,
    erc20Address:
      !currencyContractAddress || currencyContractAddress === ethers.ZeroAddress
        ? undefined
        : currencyContractAddress,
    amount: amountInCrypto,
  })

  if (usdExchangeRate.priceInAmount) {
    return {
      currency: 'usd',
      amount: usdExchangeRate.priceInAmount,
      decimals: 0, // The API returns prices in $, so no decimals
    }
  }

  return undefined
}

/** Get usd pricing for a specific recipient */
export const getFiatPricingForRecipient = async ({
  lockAddress,
  network,
  userAddress,
  data,
  referrer,
}: PricingForRecipientProps): Promise<any> => {
  const web3Service = getWeb3Service()

  const [{ decimals, currencyContractAddress }, pricingFromSettings] =
    await Promise.all([
      getLockKeyPricingFromContract({
        lockAddress,
        network,
      }),
      getKeyPricingFromSettings({
        lockAddress,
        network,
      }),
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

  const usdPricingForRecipient = await getDefiLlamaPrice({
    network,
    erc20Address:
      !currencyContractAddress || currencyContractAddress === ethers.ZeroAddress
        ? undefined
        : currencyContractAddress,
    amount,
  })

  return {
    address: userAddress,
    price: {
      amount: usdPricingForRecipient.priceInAmount!,
      decimals: 0,
      currency: 'usd',
    },
  }
}
