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
import normalizer from './normalizer'

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
    currencyContractAddress && currencyContractAddress !== ethers.ZeroAddress
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
export const getUnlockServiceFee = (
  cost: number,
  options?: KeyPricingOptions
) => {
  if (
    normalizer.ethereumAddress(options?.lockAddress) ===
    '0x45aCCac0E5C953009cDa713a3b722F87F2907F86'
  ) {
    // For CabinDAO, fee is $20
    return 20
  }

  if (
    normalizer.ethereumAddress(options?.lockAddress) ===
      '0xB9d79698599B3efa025c654B4c6f2c760c15d0d0' ||
    normalizer.ethereumAddress(options?.lockAddress) ===
      '0xc94b031cE1837277dDABaFE2d993e0A9a2FC4E92' ||
    normalizer.ethereumAddress(options?.lockAddress) ===
      '0xcbEF4c0E59A224B56D408CE72C59f0D275E7adAe' ||
    normalizer.ethereumAddress(options?.lockAddress) ===
      '0x3EbE147eCd6970f49fde34b5042996e140f63c22'
  ) {
    // For LexDAO, we take 3% only
    return Math.ceil(cost * 0.03)
  }

  if (
    normalizer.ethereumAddress(options?.lockAddress) ===
    '0x456CC03543d41Eb1c9a7cA9FA86e9383B404f50d'
  ) {
    // For FarCon Summit, we take 2.5% only
    return Math.ceil(cost * 0.025)
  }

  if (
    normalizer.ethereumAddress(options?.lockAddress) ===
    '0x68445fE0f063f60B3C2Ec460f13E17b7FCb868b9'
  ) {
    // For Best Dish Ever Sous Chef, we take 4% only
    return Math.ceil(cost * 0.04)
  }

  if (
    normalizer.ethereumAddress(options?.lockAddress) ===
    '0x1a84dEf3EC4d03E3c509E4708890dF9D4428f9fb'
  ) {
    // For Best Dish Ever OWNER CHEF MEMBER, we take 2% only
    return Math.ceil(cost * 0.02)
  }

  // Defaults to 5%
  const fee = cost * 0.05

  // At least $1
  if (fee < 1) {
    return 1
  }

  // At most $10
  if (fee > 10) {
    return 10
  }

  return fee
}

export const getFees = async (
  { subtotal, gasCost }: Record<'subtotal' | 'gasCost', number>,
  options?: KeyPricingOptions
) => {
  const { lockAddress, network } = options ?? {}
  const unlockServiceFee = getUnlockServiceFee(subtotal, options)
  let unlockFeeChargedToUser = true

  // fees can be ignored if disabled by lockManager
  if (lockAddress && network) {
    const data = await getLockSettings({
      lockAddress,
      network,
    })
    unlockFeeChargedToUser = data?.unlockFeeChargedToUser ?? true
  }

  const creditCardProcessingFee = getCreditCardProcessingFee(
    subtotal + gasCost,
    unlockServiceFee
  )

  const feePaidByUser = unlockFeeChargedToUser ? unlockServiceFee : 0
  let total = feePaidByUser + creditCardProcessingFee + subtotal + gasCost

  if (total < MIN_PAYMENT_STRIPE_CREDIT_CARD) {
    total = MIN_PAYMENT_STRIPE_CREDIT_CARD
  }

  return {
    unlockServiceFee,
    creditCardProcessingFee,
    gasCost,
    total,
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
    subtotal,
    gasCost,
    isCreditCardPurchasable: fees.total > MIN_PAYMENT_STRIPE_CREDIT_CARD,
  }
}
