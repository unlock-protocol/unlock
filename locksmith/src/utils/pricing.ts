import { networks } from '@unlock-protocol/networks'
import { Web3Service, getErc20Decimals } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import logger from '../logger'
import GasPrice from './gasPrice'
import {
  GAS_COST,
  stripePercentage,
  baseStripeFee,
  MIN_PAYMENT_STRIPE_CREDIT_CARD,
} from './constants'
import {
  getDefaultUsdPricing,
  getUsdPricingForRecipient,
  getDefiLammaPrice,
  KeyPricing,
} from '../operations/pricingOperations'
import { getSettings as getLockSettings } from '../operations/lockSettingOperations'

interface KeyPricingOptions {
  recipients: (string | null)[]
  data?: (string | null)[] | null | undefined
  referrers?: (string | null)[] | null | undefined
  network: number
  lockAddress: string
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
}: KeyPricingOptions): Promise<KeyPricing[]> => {
  const defaultPricing = await getDefaultUsdPricing({
    lockAddress,
    network,
  })

  const result = await Promise.all(
    recipients.map(async (userAddress, index) => {
      const data = dataArray?.[index] ?? '0x'
      const referrer = referrers?.[index] ?? userAddress!

      if (!userAddress) {
        return {
          price: {
            ...defaultPricing,
          },
        }
      }

      try {
        const pricingForRecipient = await getUsdPricingForRecipient({
          lockAddress,
          network,
          userAddress,
          referrer,
          data,
        })
        return pricingForRecipient
      } catch (error) {
        logger.error(error)
        return {
          address: userAddress,
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
  const price = await getDefiLammaPrice({
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

export const getFees = async (
  { subtotal, gasCost }: Record<'subtotal' | 'gasCost', number>,
  options?: KeyPricingOptions
) => {
  const { lockAddress, network } = options ?? {}
  let unlockServiceFee = getUnlockServiceFee(subtotal)

  // fees can be ignored if disabled by lockManager
  if (lockAddress && network) {
    const { unlockFeeChargedToUser } = await getLockSettings({
      lockAddress,
      network,
    })

    if (!unlockFeeChargedToUser) {
      unlockServiceFee = 0
    }
  }

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
  const fees = await getFees(
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
