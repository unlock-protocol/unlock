import { Web3Service } from '@unlock-protocol/unlock-js'
import { ItemizedKeyPrice } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved

class KeyPricer {
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
    let lock = await this.readOnlyEthereumService.getLock(lockAddress)
    return Math.round(Number(lock.keyPrice) * 100)
  }

  // Fee denominated in cents
  gasFee(): number {
    return 30
  }

  // Fee denominated in cents
  creditCardProcessingFee(keyPrice: number): number {
    const baseStripeFee = 30
    // This is rounded to an integer number of cents.
    // TODO: use a library to do this better?
    const percentageFee = Math.ceil(keyPrice * 0.029)

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

export = KeyPricer
