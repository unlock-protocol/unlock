var UnlockJs = require('@unlock-protocol/unlock-js')
var HDWalletProvider = require('truffle-hdwallet-provider')

const { WalletService, Web3Service } = UnlockJs

export default class Dispatcher {
  constructor(unlockAddress, purchasingAddress, credentials, host) {
    this.unlockAddress = unlockAddress
    this.purchasingAddress = purchasingAddress
    this.provider = new HDWalletProvider(credentials, host)
  }

  retrieveLock(lockAddress) {
    try {
      let w3s = new Web3Service({
        readOnlyProvider: this.provider,
        unlockAddress: this.unlockAddress,
      })

      return w3s.getLock(lockAddress)
    } catch (error) {
      throw new Error('Unable to retrieve Lock information')
    }
  }

  async purchase(lockAddress, recipient) {
    let walletService = new WalletService({
      unlockAddress: this.unlockAddress,
    })

    let lock = await this.retrieveLock(lockAddress)

    if (lock.outstandingKeys == lock.maxNumberOfKeys) {
      throw new Error('No Available Keys.')
    }

    walletService.connect(this.provider)
    walletService.purchaseKey(
      lockAddress,
      recipient,
      lock.keyPrice,
      this.purchasingAddress
    )
  }
}
