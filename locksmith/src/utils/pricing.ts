import { networks } from '@unlock-protocol/networks'
import { Web3Service, getErc20Decimals } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import logger from '../logger'
import GasPrice from './gasPrice'
import { GAS_COST, stripePercentage, baseStripeFee } from './constants'
import * as lockSettingOperations from '../operations/lockSettingOperations'
import * as Normalizer from '../utils/normalizer'
export interface Options {
  amount?: number
  tokenAddress?: string
  network: number
}

interface Price {
  decimals: number
  symbol: string
  price: number
  timestamp: number
  confidence: number
}

export async function defiLammaPrice({
  network,
  tokenAddress,
  amount = 1,
}: Options): Promise<
  Partial<
    Price & {
      priceInAmount: number
    }
  >
> {
  const networkConfig = networks[network]
  if (!network) {
    return {}
  }
  const items: string[] = []
  const coingecko = `coingecko:${networkConfig.nativeCurrency?.coingecko}`
  const mainnetTokenAddress = networkConfig.tokens?.find(
    (item) => item.address?.toLowerCase() === tokenAddress?.toLowerCase()
  )?.mainnetAddress

  if (mainnetTokenAddress) {
    items.push(`ethereum:${mainnetTokenAddress}`)
  }

  if (tokenAddress) {
    items.push(`${networkConfig.chain}:${tokenAddress}`)
  }

  if (!tokenAddress && coingecko) {
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

interface KeyPricingOptions {
  recipients: (string | null)[]
  data?: (string | null)[] | null | undefined
  referrers?: (string | null)[] | null | undefined
  network: number
  lockAddress: string
}

const fromDecimal = (num: string, decimals: number) => {
  return parseFloat(
    ethers.utils
      .formatUnits(ethers.BigNumber.from(num), decimals)
      .replace(/\.0$/, '')
  )
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

export const getKeyPricingInUSD = async ({
  recipients,
  network,
  lockAddress,
  data: dataArray,
  referrers,
}: KeyPricingOptions) => {
  const web3Service = new Web3Service(networks)
  const { keyPrice, decimals, currencyContractAddress } =
    await getLockKeyPricing({
      lockAddress,
      network,
    })

  const usdPricing = await defiLammaPrice({
    network,
    tokenAddress:
      !currencyContractAddress ||
      currencyContractAddress === ethers.constants.AddressZero
        ? undefined
        : currencyContractAddress,
    amount: 1,
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

  const result = await Promise.all(
    recipients.map(async (address, index) => {
      const data = dataArray?.[index] ?? '0x'
      const referrer = referrers?.[index] ?? address!

      if (!address) {
        return {
          recipient: null,
          ...defaultPricing,
        }
      }

      try {
        const purchasePrice = await web3Service.purchasePriceFor({
          lockAddress,
          userAddress: address,
          data,
          network,
          referrer,
        })
        const amount = fromDecimal(purchasePrice, decimals)
        return {
          address,
          price: {
            amount,
            decimals,
            symbol: usdPricing.symbol,
            amountInUSD: usdPricing?.price
              ? amount * usdPricing.price
              : undefined,
            amountInCents: usdPricing?.price
              ? Math.round(amount * usdPricing.price * 100)
              : 0,
          },
        }
      } catch (error) {
        logger.error(error)
        return {
          address,
          ...defaultPricing,
        }
      }
    })
  )
  return result
}

export const getGastCost = async ({ network }: Record<'network', number>) => {
  const gas = new GasPrice()
  const amount = await gas.gasPriceETH(network, GAS_COST)
  const price = await defiLammaPrice({
    network,
    amount,
  })
  return Math.round((price.priceInAmount || 0) * 100)
}

// Fee denominated in cents
export const getCreditCardProcessingFee = (
  subtotal: number,
  serviceFee: number
) => {
  const total = subtotal + serviceFee
  // This is rounded up to an integer number of cents.
  const percentageFee = Math.ceil(total * stripePercentage)
  return baseStripeFee + percentageFee
}

// Fee denominated in cents
export const getUnlockServiceFee = (cost: number) => {
  return Math.ceil(cost * 0.1) // Unlock charges 10% of transaction.
}

export const getFees = ({
  subtotal,
  gasCost,
}: Record<'subtotal' | 'gasCost', number>) => {
  const unlockServiceFee = getUnlockServiceFee(subtotal)
  const creditCardProcessingFee = getCreditCardProcessingFee(
    subtotal + gasCost,
    unlockServiceFee
  )
  return {
    unlockServiceFee,
    creditCardProcessingFee,
    gasCost,
    total: unlockServiceFee + creditCardProcessingFee + subtotal + gasCost,
  }
}

export const createTotalCharges = async ({
  lockAddress,
  amount,
  network,
  tokenAddress,
}: {
  lockAddress: string
  network: number
  amount: number
  tokenAddress?: string
}) => {
  const [pricing, gasCost] = await Promise.all([
    defiLammaPrice({
      network,
      amount,
      tokenAddress,
    }),
    getGastCost({ network }),
  ])

  let creditCardTotal = undefined
  if (lockAddress) {
    const settings = await lockSettingOperations.getSettings({
      lockAddress: Normalizer.ethereumAddress(lockAddress),
      network,
    })

    // total credit card for keys
    if (settings?.creditCardPrice) {
      creditCardTotal = settings?.creditCardPrice * amount
    }
  }

  const hasPrice = pricing?.priceInAmount || creditCardTotal

  if (!hasPrice) {
    return {
      total: 0,
      subtotal: 0,
      gasCost,
      unlockServiceFee: 0,
      creditCardProcessingFee: 0,
      isCreditCardPurchasable: false,
    }
  }

  const price = creditCardTotal ?? pricing.priceInAmount
  const subtotal = Math.round(price! * 100)
  const fees = getFees({
    subtotal,
    gasCost,
  })
  const result = {
    ...fees,
    subtotal,
    isCreditCardPurchasable: fees.total > 50,
  }
  return result
}

export const createPricingForPurchase = async (options: KeyPricingOptions) => {
  const recipients = await getKeyPricingInUSD(options)
  const subtotal = recipients.reduce(
    (sum, item) => sum + (item.price?.amountInCents || 0),
    0
  )
  const gasCost = await getGastCost(options)
  const fees = getFees({
    subtotal,
    gasCost,
  })

  return {
    ...fees,
    recipients,
    gasCost,
    isCreditCardPurchasable: fees.total > 50,
  }
}
