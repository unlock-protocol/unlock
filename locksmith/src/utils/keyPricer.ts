import { ethers } from 'ethers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

import * as Normalizer from './normalizer'
import { ItemizedKeyPrice } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved
import PriceConversion from './priceConversion'

// Stripe's fee is 30 cents plus 2.9% of the transaction.
const baseStripeFee = 30
const stripePercentage = 0.029
const ZERO = ethers.constants.AddressZero
export const GAS_COST = 200000 // hardcoded : TODO get better estimate, based on actual execution

export const MAX_GRANT_COST = 1000 // Maximum price we're willing to pay to grant keys! (1000 => 1ct)

export default class KeyPricer {
  readOnlyEthereumService: any

  constructor() {
    this.readOnlyEthereumService = new Web3Service(networks)
  }

  async keyPriceUSD(lockAddress: string, network: number): Promise<number> {
    const lock = await this.readOnlyEthereumService.getLock(
      Normalizer.ethereumAddress(lockAddress),
      network,
      { fields: ['currencyContractAddress', 'currencySymbol', 'keyPrice'] }
    )
    let symbol = 'ETH'
    if (!lock.currencyContractAddress || lock.currencyContractAddress == ZERO) {
      if (network === 100) {
        symbol = 'DAI'
      } else if (network === 137) {
        symbol = 'MATIC'
      }
    } else {
      symbol = lock.currencySymbol
    }

    const priceConversion = new PriceConversion()
    return priceConversion.convertToUSD(symbol, lock.keyPrice)
  }

  // Fee denominated in cents by default. multiply base to get more accurate
  async gasFee(network: number, base?: number): Promise<number> {
    if (!base) {
      base = 1
    }
    const providerUrl = networks[network].publicProvider
    const provider = new ethers.providers.JsonRpcProvider(providerUrl)

    // Price of gas
    const gasPrice: any = await provider.getGasPrice()

    // Cost in gwei
    const costInGwei = gasPrice * GAS_COST

    // Cost in base currency
    const gasCost =
      parseFloat(
        ethers.utils.formatEther(
          ethers.utils.parseUnits(costInGwei.toString(), 'wei')
        )
      ) * base

    let symbol = 'ETH'
    if (network === 100) {
      symbol = 'DAI'
    }
    if (network === 137) {
      symbol = 'MATIC'
    }
    // TODO: support more "native" currencies

    const priceConversion = new PriceConversion()
    return priceConversion.convertToUSD(symbol, gasCost)
  }

  // Fee denominated in cents
  creditCardProcessingFee(subtotal: number): number {
    // This is rounded up to an integer number of cents.
    const percentageFee = Math.ceil(subtotal * stripePercentage)

    return baseStripeFee + percentageFee
  }

  // Fee denominated in cents
  unlockServiceFee(cost: number): number {
    return Math.ceil(cost * 0.1) // Unlock charges 10% of transaction.
  }

  async generate(
    lockAddress: string,
    network: number
  ): Promise<ItemizedKeyPrice> {
    // Here we need to get the conversion as well!
    const usdKeyPrice = await this.keyPriceUSD(lockAddress, network)

    const gasFee = await this.gasFee(network)
    const unlockServiceFee = this.unlockServiceFee(usdKeyPrice) + gasFee

    return {
      keyPrice: usdKeyPrice,
      unlockServiceFee,
      creditCardProcessing: this.creditCardProcessingFee(
        usdKeyPrice + unlockServiceFee
      ),
    }
  }
}
