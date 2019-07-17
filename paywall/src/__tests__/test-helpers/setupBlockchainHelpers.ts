import {
  WalletServiceType,
  Web3ServiceType,
} from '../../data-iframe/blockchainHandler/blockChainTypes'

export function getWalletService(listeners: { [key: string]: Function }) {
  const walletService: WalletServiceType = {
    ready: true,
    connect: jest.fn(),
    getAccount: jest.fn(),
    purchaseKey: jest.fn(),
    addListener: jest.fn(),
    on: (type, listener) => {
      listeners[type as string] = listener
      return walletService
    },
    once: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    removeAllListeners: jest.fn(),
    off: jest.fn(),
    removeListener: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    emit: (type, ...args) => {
      listeners[type as string](...args)
      return true
    },
    eventNames: jest.fn(),
    listenerCount: jest.fn(),
  }
  return walletService
}

export function getWeb3Service(listeners: { [key: string]: Function }) {
  const web3Service: Web3ServiceType = {
    refreshAccountBalance: jest.fn().mockRejectedValue('123'),
    getTransaction: jest.fn(),
    getLock: jest.fn(),
    getKeyByLockForOwner: jest.fn(),
    addListener: jest.fn(),
    on: (type, listener) => {
      listeners[type as string] = listener
      return web3Service
    },
    once: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    removeAllListeners: jest.fn(),
    off: jest.fn(),
    removeListener: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    emit: (type, ...args) => {
      listeners[type as string](...args)
      return true
    },
    eventNames: jest.fn(),
    listenerCount: jest.fn(),
  }
  return web3Service
}
