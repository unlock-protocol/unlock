import Postmate from 'postmate'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { BlockchainReader } from './BlockchainReader'
import { BlockchainDataStorable } from './BlockchainDataStorable'
import configure from '../config'

const {
  readOnlyProvider,
  unlockAddress,
  blockTime,
  requiredConfirmations,
} = configure()
const web3Service = new Web3Service({
  readOnlyProvider,
  unlockAddress,
  blockTime,
  requiredConfirmations,
})

// Start with a null object, it will be replaced when the authenticate
// method in the model is called.
let blockchainReader = new BlockchainDataStorable()

const initializeReader = (lockAddresses: string[], accountAddress: string) => {
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

const handshake = new Postmate.Model({
  locks: () => blockchainReader.locks,
  keys: () => blockchainReader.keys,
  transactions: () => blockchainReader.transactions,
  initializeReader,
})

handshake.then(parent => {
  parent.emit('ready')
})
