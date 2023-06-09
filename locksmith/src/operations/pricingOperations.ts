import networks from '@unlock-protocol/networks'
import { getFees, getGasCost } from '../utils/pricing'
import { MIN_PAYMENT_STRIPE_CREDIT_CARD } from '../utils/constants'
import { ethers } from 'ethers'
import { Web3Service, getErc20Decimals } from '@unlock-protocol/unlock-js'

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

const fromDecimal = (num: string, decimals: number) => {
  return parseFloat(
    ethers.utils
      .formatUnits(ethers.BigNumber.from(num), decimals)
      .replace(/\.0$/, '')
  )
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

export const getLockKeyPricing = async ({
  lockAddress,
  network,
}: {
  lockAddress: string
  network: number
}) => {
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
  const { keyPrice, decimals, currencyContractAddress } =
    await getLockKeyPricing({
      lockAddress,
      network,
    })

  const usdPricing = await getDefiLammaPrice({
    network,
    erc20Address:
      !currencyContractAddress ||
      currencyContractAddress === ethers.constants.AddressZero
        ? undefined
        : currencyContractAddress,
  })

  const defaultPrice = fromDecimal(keyPrice, decimals)

  const defaultPricing = {
    amount: defaultPrice,
    decimals,
    symbol: usdPricing.symbol,
    amountInUSD: usdPricing?.price
      ? defaultPrice * usdPricing.price
      : undefined,
    amountInCents: usdPricing?.price
      ? Math.round(defaultPrice * usdPricing.price * 100)
      : 0,
  }

  return defaultPricing
}

/** Get default pricing for a specific recipient */
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

  const [purchasePrice, usdPricing] = await Promise.all([
    web3Service.purchasePriceFor({
      lockAddress,
      userAddress,
      data,
      network,
      referrer,
    }),
    getDefiLammaPrice({
      network,
      erc20Address:
        !currencyContractAddress ||
        currencyContractAddress === ethers.constants.AddressZero
          ? undefined
          : currencyContractAddress,
      amount: 1,
    }),
  ])

  const amount = fromDecimal(purchasePrice, decimals)

  return {
    address: userAddress,
    price: {
      amount,
      decimals,
      symbol: usdPricing.symbol,
      amountInUSD: usdPricing?.price ? amount * usdPricing.price : undefined,
      amountInCents: usdPricing?.price
        ? Math.round(amount * usdPricing.price * 100)
        : 0,
    },
  }
}
