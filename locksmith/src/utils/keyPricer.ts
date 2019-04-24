import { ItemizedKeyPrice } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved

class KeyPricer {
  // eslint-disable-next-line no-unused-vars
  keyPrice(_lockAddress: string): number {
    return 220
  }

  gasFee(): number {
    return 30
  }

  creditCardProcessingFee(): number {
    return 450
  }

  unlockServiceFee(): number {
    return 20
  }

  generate(lockAddress: string): ItemizedKeyPrice {
    return {
      keyPrice: this.keyPrice(lockAddress),
      gasFee: this.gasFee(),
      creditCardProcessing: this.creditCardProcessingFee(),
      unlockServiceFee: this.unlockServiceFee(),
    }
  }
}

export = KeyPricer
