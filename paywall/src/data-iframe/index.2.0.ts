import Postmate from 'postmate'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { BlockchainReader } from './BlockchainReader'
import { BlockchainDataStorable } from './BlockchainDataStorable'

declare var __ENVIRONMENT_VARIABLES__: any

// TODO FIND A WAY TO MOVE THIS IN A BETTER PLACE
// NOTE: NEVER PUT ENV VARS HERE
const constants: { [key: string]: any } = {
  dev: {
    unlockAddress: '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93',
    blockTime: 3000,
    requiredConfirmations: 6,
    defaultNetwork: 1984,
  },
  test: {
    unlockAddress: '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93',
    blockTime: 3000,
    requiredConfirmations: 6,
    defaultNetwork: 1984,
  },
  staging: {
    unlockAddress: '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b',
    blockTime: 8000,
    requiredConfirmations: 12,
    defaultNetwork: 4,
  },
  prod: {
    unlockAddress: '0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13',
    blockTime: 8000,
    requiredConfirmations: 12,
    defaultNetwork: 1,
  },
}

const config = {
  ...__ENVIRONMENT_VARIABLES__,
  ...constants[__ENVIRONMENT_VARIABLES__.unlockEnv],
}

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

// Start with a null object, it will be replaced when the authenticate
// method in the model is called.
let blockchainReader = new BlockchainDataStorable()

interface ReaderArgs {
  lockAddresses: string[]
  accountAddress: string
}
const initializeReader = ({ lockAddresses, accountAddress }: ReaderArgs) => {
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
