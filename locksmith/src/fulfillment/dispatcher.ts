import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'

const HDWalletProvider = require('@truffle/hdwallet-provider')
const {
  findOrCreateTransaction,
} = require('../operations/transactionOperations')

export default class Dispatcher {
  unlockAddress: string

  provider: any

  buyer: string

  constructor(
    unlockAddress: string,
    credentials: any,
    host: string,
    buyer: string
  ) {
    this.unlockAddress = unlockAddress
    this.provider = new HDWalletProvider(credentials, host)
    this.buyer = buyer
  }

  async retrieveLock(lockAddress: string) {
    try {
      const w3s = new Web3Service({
        readOnlyProvider: this.provider,
        unlockAddress: this.unlockAddress,
      })

      return await w3s.getLock(lockAddress)
    } catch (error) {
      throw new Error('Unable to retrieve Lock information')
    }
  }

  async purchase(lockAddress: string, recipient: string) {
    const walletService = new WalletService({
      unlockAddress: this.unlockAddress,
    })

    const lock = await this.retrieveLock(lockAddress)

    if (lock.outstandingKeys == lock.maxNumberOfKeys) {
      throw new Error('No Available Keys.')
    }

    const txHashPromise = new Promise(resolve => {
      // TODO: do not rely on 'transaction.new' event (as future versions of unlockjs may not be an event emitter anymore, but on the optional callback to purchaseKey. Unfortunately, that callback only includes the transaction hash for now. We will need unlock-js to yield the sender, recipient and data too)
      walletService.on(
        'transaction.new',
        async (
          transactionHash: string,
          sender: string,
          recipient: string,
          data: string
        ) => {
          await findOrCreateTransaction({
            transactionHash,
            sender,
            recipient,
            chain: walletService.networkId,
            for: this.buyer,
            data,
          })

          resolve(transactionHash)
        }
      )
    })

    await walletService.connect(this.provider)
    // Let's not await on the transaction to be mined
    walletService.purchaseKey({
      lockAddress,
      owner: recipient,
      keyPrice: lock.keyPrice,
    })
    return txHashPromise
  }
}
