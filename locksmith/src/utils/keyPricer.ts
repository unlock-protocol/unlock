import { ethers } from 'ethers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import logger from '../logger'

import * as Normalizer from './normalizer'
import { ItemizedKeyPrice } from '../types'
import PriceConversion from './priceConversion'
import GasPrice from './gasPrice'

// Stripe's fee is 30 cents plus 2.9% of the transaction.
const baseStripeFee = 30
const stripePercentage = 0.029
const ZERO = ethers.constants.AddressZero
export const GAS_COST = 200000 // hardcoded : TODO get better estimate, based on actual execution

export const GAS_COST_TO_GRANT = 250000

export default class KeyPricer {
  readOnlyEthereumService: any

  constructor() {
    this.readOnlyEthereumService = new Web3Service(networks)
  }

  async canAffordGrant(network: number): Promise<boolean> {
    const gasPrice = new GasPrice()
    const gasCost = await gasPrice.gasPriceUSD(network, GAS_COST_TO_GRANT) // in cents!
    if (!networks[network].maxFreeClaimCost) {
      return false
    }
    return gasCost < networks[network].maxFreeClaimCost!
  }

  async keyPriceUSD(lockAddress: string, network: number) {
    // can we reduce load here?
    const lock = await this.readOnlyEthereumService.getLock(
      Normalizer.ethereumAddress(lockAddress),
      network,
      { fields: ['currencyContractAddress', 'currencySymbol', 'keyPrice'] }
    )
    let symbol =
      networks[network]?.nativeCurrency?.coinbase ||
      networks[network]?.nativeCurrency?.symbol
    if (lock?.currencyContractAddress !== ZERO && lock.currencySymbol) {
      symbol = lock.currencySymbol
    }
    if (!symbol) {
      logger.info(
        `We could not determine currency symbol for ${lockAddress} on ${network}`
      )
      throw new Error(`Missing currency`)
    }
    const priceConversion = new PriceConversion()
    const usdPrice = await priceConversion.convertToUSD(
      symbol.toUpperCase(),
      lock.keyPrice
    )
    return usdPrice
  }

  // Fee denominated in cents by default. multiply base to get more accurate
  async gasFee(network: number, base?: number): Promise<number> {
    if (!base) {
      base = 1
    }

    const gasPrice = new GasPrice()
    // Price of gas
    const gasCost = (await gasPrice.gasPriceUSD(network, GAS_COST)) * base
    return gasCost
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
    network: number,
    quantity = 1
  ): Promise<ItemizedKeyPrice> {
    const [usdKeyPrice, gasFee] = await Promise.all([
      this.keyPriceUSD(lockAddress, network),
      this.gasFee(network),
    ])
    const usdKeyPricing = usdKeyPrice * quantity
    let unlockServiceFee = gasFee

    //  Temporary : for some locks, Unlock labs does not take credit card fees (only gas)
    if (
      ['0x339D848115981125eEfBA2F654E1F9644363c7DB'].indexOf(lockAddress) === -1
    ) {
      unlockServiceFee += this.unlockServiceFee(usdKeyPricing)
    }

    return {
      keyPrice: usdKeyPricing, // shows price for all of the keys
      unlockServiceFee,
      creditCardProcessing: this.creditCardProcessingFee(
        usdKeyPricing + unlockServiceFee
      ),
    }
  }
}
