import { networks } from '@unlock-protocol/networks'
import { Web3Service, getErc20Decimals } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import logger from '../logger'
import GasPrice from './gasPrice'
import { GAS_COST, stripePercentage, baseStripeFee } from './constants'
import * as pricingOperations from '../operations/pricingOperations'

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

export const getKeyPricingInUSD = async ({
  recipients,
  network,
  lockAddress,
  data: dataArray,
  referrers,
}: KeyPricingOptions): Promise<KeyPricing[]> => {
  const web3Service = new Web3Service(networks)
  const { keyPrice, decimals, currencyContractAddress } =
    await getLockKeyPricing({
      lockAddress,
      network,
    })

  const usdPricing = await pricingOperations.getDefiLammaPrice({
    network,
    erc20Address:
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
          price: {
            ...defaultPricing,
          },
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
    isCreditCardPurchasable: fees.total > 50,
  }
}
