import { Web3Service } from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { ItemizedKeyPrice } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved
import PriceConversion from './priceConversion'

// Stripe's fee is 30 cents plus 2.9% of the transaction.
const baseStripeFee = 30
const stripePercentage = 0.029
const ZERO = ethers.constants.AddressZero

export default class KeyPricer {
  readOnlyEthereumService: any

  constructor(providerURL: string, unlockContractAddress: string) {
    this.readOnlyEthereumService = new Web3Service({
      readOnlyProvider: providerURL,
      unlockAddress: unlockContractAddress,
      blockTime: 0,
      requiredConfirmations: 0,
    })
  }

  async keyPrice(lockAddress: string): Promise<number> {
    const lock = await this.readOnlyEthereumService.getLock(lockAddress)
    return Math.round(Number(lock.keyPrice) * 100)
  }

  async keyPriceUSD(lockAddress: string): Promise<number> {
    let symbol: string

    const lock = await this.readOnlyEthereumService.getLock(lockAddress)
    if (lock.tokenAddress == ZERO) {
      symbol = 'ETH'
    } else {
      symbol = lock.erc20Symbol
    }

    const priceConversion = new PriceConversion()
    return priceConversion.convertToUSD(symbol, lock.keyPrice)
  }

  // Fee denominated in cents
  gasFee(): number {
    // For the time being gas fees are covered by the unlockServiceFee
    return 0
  }

  // Fee denominated in cents
  creditCardProcessingFee(keyPrice: number): number {
    const subtotal = keyPrice + this.gasFee() + this.unlockServiceFee()

    // This is rounded up to an integer number of cents.
    const percentageFee = Math.ceil(subtotal * stripePercentage)

    return baseStripeFee + percentageFee
  }

  // Fee denominated in cents
  unlockServiceFee(): number {
    return 50
  }

  async generate(lockAddress: string): Promise<ItemizedKeyPrice> {
    const keyPrice = await this.keyPrice(lockAddress)
    return {
      keyPrice,
      gasFee: this.gasFee(),
      creditCardProcessing: this.creditCardProcessingFee(keyPrice),
      unlockServiceFee: this.unlockServiceFee(),
    }
  }
}
