import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import * as Normalizer from './normalizer'
import { ItemizedKeyPrice } from '../types'
import GasPrice from './gasPrice'
import { defiLammaPrice } from './pricing'

// Stripe's fee is 30 cents plus 2.9% of the transaction.
const baseStripeFee = 30
const stripePercentage = 0.029
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
    const lock = await this.readOnlyEthereumService.getLock(
      Normalizer.ethereumAddress(lockAddress),
      network,
      { fields: ['currencyContractAddress', 'keyPrice'] }
    )

    const pricing = await defiLammaPrice({
      network,
      address: lock.currencyContractAddress,
      amount: parseFloat(lock.keyPrice),
    })
    if (!pricing?.priceInAmount) {
      throw new Error('Could not get pricing for lock')
    }
    return pricing.priceInAmount * 100 // convert to cents
  }

  // Fee denominated in cents by default. multiply base to get more accurate
  async gasFee(network: number, base?: number): Promise<number> {
    if (!base) {
      base = 1
    }

    const gasPrice = new GasPrice()
    // Price of gas
    const gasCost = await gasPrice.gasPriceUSD(network, GAS_COST)
    return gasCost * base
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
    // Here we need to get the conversion as well!
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
