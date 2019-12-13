import Postmate from 'postmate'
import { Web3Service, WalletService } from '@unlock-protocol/unlock-js'
import { BlockchainReader } from './BlockchainReader'
import { BlockchainDataStorable } from './BlockchainDataStorable'
import config from './constants'
import BlockchainWriter from './BlockchainWriter'
import { TransactionDefaults } from './blockchainHandler/blockChainTypes'

const {
  readOnlyProvider,
  unlockAddress,
  blockTime,
  requiredConfirmations,
} = config

const web3Service = new Web3Service({
  readOnlyProvider,
  unlockAddress,
  blockTime,
  requiredConfirmations,
})

let accountAddress: string | null = null
let lockAddresses: string[] = []

const walletService = new WalletService({
  unlockAddress,
})

// Start with a null object, it will be replaced when the
// initializeReader method in the model is called.
let blockchainReader = new BlockchainDataStorable()

function initializeReader() {
  // We'll call initializeReader anytime a thing happens that might
  // invalidate data (changed account, changed network...) and on
  // initial startup (got lock addresses from config). Because it's
  // hard to synchronize the data coming from various places, we'll
  // call it frequently but only take action if we have all necessary
  // data.
  if (accountAddress) {
    // since we may destroy a previous BlockchainReader with this
    // operation, we should also make sure not to retain any event
    // listeners that involve the old object
    web3Service.removeAllListeners()
    blockchainReader = new BlockchainReader(
      web3Service,
      lockAddresses,
      accountAddress
    )
  }
}

const handshake = new Postmate.Model({
  locks: () => blockchainReader.locks,
  keys: () => blockchainReader.keys,
  transactions: () => blockchainReader.transactions,
  initializeReader,
})

handshake.then(parent => {
  parent.emit('ready')
})
