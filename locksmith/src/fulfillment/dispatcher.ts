import { WalletService, Web3Service } from '@unlock-protocol/unlock-js'

const { ethers } = require('ethers')
const logger = require('../logger')
const { networks } = require('../networks')

const {
  findOrCreateTransaction,
} = require('../operations/transactionOperations')

export default class Dispatcher {
  unlockAddress: string

  provider: any

  buyer: string

  credentials: string

  host: string

  keyGranter: any

  constructor(
    unlockAddress: string,
    credentials: any,
    host: string,
    buyer: string
  ) {
    this.credentials = credentials
    this.host = host

    this.unlockAddress = unlockAddress
    this.buyer = buyer
  }

  async retrieveLock(lockAddress: string, network: number) {
    try {
      const w3s = new Web3Service(networks)

      return await w3s.getLock(lockAddress, network)
    } catch (error) {
      throw new Error('Unable to retrieve Lock information')
    }
  }

  async grantKey(lockAddress: string, recipient: string, network: number) {
    const walletService = new WalletService(networks)

    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].readOnlyProvider
    )
    const walletWithProvider = new ethers.Wallet(this.credentials, provider)
    await walletService.connect(provider, walletWithProvider)

    return await walletService.grantKey({
      lockAddress,
      recipient,
    })
  }

  async purchase(lockAddress: string, recipient: string, network: number) {
    const walletService = new WalletService(networks)

    const lock = await this.retrieveLock(lockAddress, network)

    if (lock.outstandingKeys == lock.maxNumberOfKeys) {
      throw new Error('No Available Keys.')
    }

    logger.info('Send key purchase transaction', {
      lockAddress,
      recipient,
      provider: this.host,
    })

    const txHashPromise = new Promise((resolve) => {
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
    const provider = new ethers.providers.JsonRpcProvider(
      networks[network].readOnlyProvider
    )
    const walletWithProvider = new ethers.Wallet(this.credentials, provider)
    await walletService.connect(provider, walletWithProvider)

    // Let's not await on the transaction to be mined
    walletService.purchaseKey({
      lockAddress,
      owner: recipient,
      referrer: recipient, // We grant UDT to the recipient of the key!
      keyPrice: lock.keyPrice,
    })
    return txHashPromise
  }
}
