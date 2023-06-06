import { networks } from '@unlock-protocol/networks'
import { Web3Service, getErc20Decimals } from '@unlock-protocol/unlock-js'
import { BigNumber, ethers } from 'ethers'
import logger from '../logger'
import GasPrice from './gasPrice'
import {
  GAS_COST,
  stripePercentage,
  baseStripeFee,
  MIN_PAYMENT_STRIPE_CREDIT_CARD,
} from './constants'
import * as pricingOperations from '../operations/pricingOperations'
import { getSettings } from '../operations/lockSettingOperations'

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

interface getLockUsdPricingProps {
  lockAddress: string
  network: number
}

type UsdLockPricingResults = {
  symbol: string
  price: number
  decimals: number
  isPriceFromSettings?: boolean
}

/** Returns USD lock pricing from settings or calculated from currency */
export const getLockUsdPricing = async ({
  lockAddress,
  network,
}: getLockUsdPricingProps): Promise<UsdLockPricingResults> => {
  const { decimals, currencyContractAddress } = await getLockKeyPricing({
    lockAddress,
    network,
  })

  const { creditCardPrice } = await getSettings({
    lockAddress,
    network,
  })

  // priority to custom credit card price
  if (creditCardPrice) {
    const creditCardPriceInUsd = creditCardPrice / 100
    return {
      symbol: '$',
      price: creditCardPriceInUsd,
      decimals,
      isPriceFromSettings: true, // keep track that is price from settings
    }
  }

  // get formatted price
  const usdPricing = await pricingOperations.getDefiLammaPrice({
    network,
    erc20Address:
      !currencyContractAddress ||
      currencyContractAddress === ethers.constants.AddressZero
        ? undefined
        : currencyContractAddress,
  })

  return usdPricing as Required<UsdLockPricingResults>
}

export const getKeyPricingInUSD = async ({
  recipients,
  network,
  lockAddress,
  data: dataArray,
  referrers,
}: KeyPricingOptions): Promise<KeyPricing[]> => {
  const web3Service = new Web3Service(networks)
  const { keyPrice, decimals } = await getLockKeyPricing({
    lockAddress,
    network,
  })

  const defaultPrice = fromDecimal(
    BigNumber.from(keyPrice).toString(),
    decimals
  )

  const usdPricing = await getLockUsdPricing({
    lockAddress,
    network,
  })

  const { isPriceFromSettings = false } = usdPricing

  // use number of recipients as total items from for credit card or amount if not
  const totalItems = isPriceFromSettings
    ? recipients?.length || 1
    : defaultPrice

  // use credit card price as amount if present
  const amount = isPriceFromSettings ? usdPricing.price : defaultPrice

  const amountInUSD = usdPricing?.price
    ? totalItems * usdPricing.price
    : undefined

  const amountInCents = usdPricing?.price
    ? Math.round(totalItems * usdPricing.price * 100)
    : 0

  const defaultPricing = {
    amount,
    decimals,
    symbol: usdPricing.symbol,
    amountInUSD,
    amountInCents,
  }

  const result = await Promise.all(
    recipients.map(async (address, index) => {
      const data = dataArray?.[index] ?? '0x'
      const referrer = referrers?.[index] ?? address!

      if (!address) {
        return {
          price: {
            ...defaultPricing,
          },
        }
      }

      const { price, symbol } = usdPricing ?? {}
      try {
        let amount: number
        let amountInUSD: number
        let amountInCents: number | undefined

        // use credit card price as amount when is set
        if (isPriceFromSettings) {
          amount = price
          amountInUSD = price
          amountInCents = Math.round(price * 100)
        } else {
          const purchasePrice = await web3Service.purchasePriceFor({
            lockAddress,
            userAddress: address,
            data,
            network,
            referrer,
          })
          amount = fromDecimal(purchasePrice, decimals)
          amountInUSD = price * amount
          amountInCents = price ? Math.round(price * 100) : undefined
        }

        return {
          address,
          price: {
            amount,
            decimals,
            symbol,
            amountInUSD,
            amountInCents,
          },
        }
      } catch (error) {
        logger.error(error)
        return {
          address,
          price: {
            ...defaultPricing,
          },
        }
      }
    })
  )
  return result
}

export const getGasCost = async ({ network }: Record<'network', number>) => {
  const gas = new GasPrice()
  const amount = await gas.gasPriceETH(network, GAS_COST)
  const price = await pricingOperations.getDefiLammaPrice({
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

export const getFees = (
  { subtotal, gasCost }: Record<'subtotal' | 'gasCost', number>,
  options?: KeyPricingOptions
) => {
  let unlockServiceFee = getUnlockServiceFee(subtotal)

  if (
    options?.lockAddress.toLowerCase() ===
    '0x45accac0e5c953009cda713a3b722f87f2907f86'.toLowerCase()
  ) {
    // For CabinDAO, we cap the fee at 20 USDC
    unlockServiceFee = 2000
  }

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

export const createPricingForPurchase = async (options: KeyPricingOptions) => {
  const recipients = await getKeyPricingInUSD(options)
  const subtotal = recipients.reduce(
    (sum, item) => sum + (item.price?.amountInCents || 0),
    0
  )
  const gasCost = await getGasCost(options)
  const fees = getFees(
    {
      subtotal,
      gasCost,
    },
    options
  )

  return {
    ...fees,
    recipients,
    gasCost,
    isCreditCardPurchasable: fees.total > MIN_PAYMENT_STRIPE_CREDIT_CARD,
  }
}
