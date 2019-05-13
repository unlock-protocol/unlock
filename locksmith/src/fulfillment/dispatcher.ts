import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'

const HDWalletProvider = require('truffle-hdwallet-provider')

export default class Dispatcher {
  purchasingAddress: string
  unlockAddress: string
  provider: any
  buyer: string

  constructor(
    unlockAddress: string,
    purchasingAddress: string,
    credentials: any,
    host: string,
    buyer: string
  ) {
    this.unlockAddress = unlockAddress
    this.purchasingAddress = purchasingAddress
    this.provider = new HDWalletProvider(credentials, host)
    this.buyer = buyer
  }

  async retrieveLock(lockAddress: string) {
    try {
      let w3s = new Web3Service({
        readOnlyProvider: this.provider,
        unlockAddress: this.unlockAddress,
      })

      return await w3s.getLock(lockAddress)
    } catch (error) {
      throw new Error('Unable to retrieve Lock information')
    }
  }

  async purchase(lockAddress: string, recipient: string) {
    let walletService = new WalletService({
      unlockAddress: this.unlockAddress,
    })

    let lock = await this.retrieveLock(lockAddress)

    if (lock.outstandingKeys == lock.maxNumberOfKeys) {
      throw new Error('No Available Keys.')
    }

    await walletService.connect(this.provider)
    await walletService.purchaseKey(
      lockAddress,
      recipient,
      lock.keyPrice,
      this.buyer
    )
  }
}
