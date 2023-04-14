import { networks } from '@unlock-protocol/networks'
import { Web3Service, getErc20Decimals } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import logger from '../logger'
import GasPrice from './gasPrice'

// Stripe's fee is 30 cents plus 2.9% of the transaction.
const baseStripeFee = 30
const stripePercentage = 0.029
export const GAS_COST = 200000 // hardcoded : TODO get better estimate, based on actual execution
export const GAS_COST_TO_GRANT = 250000

export interface Options {
  amount?: number
  address?: string
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
  address,
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
    address:
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

export const getGastCost = async ({ network }: KeyPricingOptions) => {
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

export const createPricingForPurchase = async (options: KeyPricingOptions) => {
  const recipients = await getKeyPricingInUSD(options)
  const totalCost = recipients.reduce(
    (sum, item) => sum + (item.price?.amountInCents || 0),
    0
  )
  const gasCost = await getGastCost(options)
  const unlockServiceFee = getUnlockServiceFee(totalCost + gasCost)
  const creditCardProcessingFee = getCreditCardProcessingFee(
    totalCost,
    unlockServiceFee
  )
  const total = totalCost + unlockServiceFee + creditCardProcessingFee + gasCost
  return {
    recipients,
    total,
    gasCost,
    unlockServiceFee,
    creditCardProcessingFee,
    isCreditPurchasable: total > 50,
  }
}
