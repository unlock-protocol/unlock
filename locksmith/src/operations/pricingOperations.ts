import networks from '@unlock-protocol/networks'
import { getFees, getGasCost } from '../utils/pricing'
import { MIN_PAYMENT_STRIPE_CREDIT_CARD } from '../utils/constants'
import { ethers } from 'ethers'
import { Web3Service, getErc20Decimals } from '@unlock-protocol/unlock-js'
import * as lockSettingOperations from './lockSettingOperations'

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
    ethers.utils
      .formatUnits(ethers.BigNumber.from(num), decimals)
      .replace(/\.0$/, '')
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
  const { creditCardPrice } = await lockSettingOperations.getSettings({
    lockAddress,
    network,
  })

  // return pricing object using the price from the settings
  if (creditCardPrice) {
    const keysToPurchase = recipients?.length || 1

    const amountInCents = creditCardPrice * keysToPurchase // this total is in basisPoints
    const amountInUSD = amountInCents / 100 // get total price in USD

    return {
      amount: amountInUSD, // amount is usd for the single key
      decimals: 18,
      symbol: '$',
      amountInUSD,
      amountInCents,
    }
  }

  // no custom price is found
  return null
}

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
  const fees = await getFees({
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
    currencyContractAddress &&
    currencyContractAddress !== ethers.constants.AddressZero
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
      !currencyContractAddress ||
      currencyContractAddress === ethers.constants.AddressZero
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
        currencyContractAddress === ethers.constants.AddressZero
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
    referrer,
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
