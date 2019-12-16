import Postmate from 'postmate'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { walletWrapper } from './walletWrapper'
import { BlockchainReader } from './BlockchainReader'
import { BlockchainDataStorable } from './BlockchainDataStorable'
import config from './constants'
import { WalletServiceType } from './blockchainHandler/blockChainTypes'
import { ProxyWallet } from './ProxyWallet'

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

let parent: Postmate.ChildAPI
let walletService: WalletServiceType
let proxyWallet: ProxyWallet

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

const connectProxyWallet = (walletInfo: any) => {
  proxyWallet = new ProxyWallet(walletInfo, parent.emit)
  walletService.connect(proxyWallet)
}

const handshake = new Postmate.Model({
  locks: () => blockchainReader.locks,
  keys: () => blockchainReader.keys,
  transactions: () => blockchainReader.transactions,
  initializeReader,
  connectProxyWallet,
})

handshake.then(parent => {
  walletService = walletWrapper(unlockAddress, (name, data) => {
    parent.emit(name, data)
  })
})
