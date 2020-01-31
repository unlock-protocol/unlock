import {
  WalletServiceType,
  Web3ServiceType,
  PaywallState,
  LocksmithTransactionsResult,
  FetchWindow,
  SetTimeoutWindow,
  BlockchainData,
} from '../../data-iframe/blockchainHandler/blockChainTypes'
import {
  PaywallConfig,
  Locks,
  Lock,
  TransactionStatus,
  TransactionType,
} from '../../unlockTypes'
import FakeWindow from './fakeWindowHelpers'

// TODO: this needs a lot of cleanup. Lots of redundancies.

export function getWalletService(listeners: { [key: string]: Function }) {
  const walletService: WalletServiceType = {
    ready: true,
    connect: jest.fn().mockResolvedValue({}),
    getAccount: jest.fn().mockResolvedValue(false),
    purchaseKey: jest.fn().mockResolvedValue({}),

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
    setKeyMetadata: jest.fn(),
    setUserMetadata: jest.fn(),
    getKeyMetadata: jest.fn(),
  }
  return walletService
}

export function getWeb3Service(listeners: { [key: string]: Function }) {
  const web3Service: Web3ServiceType = {
    refreshAccountBalance: jest.fn().mockResolvedValue('123'),
    getTransaction: jest.fn().mockResolvedValue({}),
    getLock: jest.fn().mockResolvedValue({}),
    getKeyByLockForOwner: jest.fn().mockResolvedValue({}),
    getTokenBalance: jest.fn().mockResolvedValue(''),

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

export const accountAddress = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'

export const addresses = [
  '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
  '0x15B87bdC4B3ecb783F56f735653332EAD3BCa5F8',
  '0xBF7F1bdB3a2D6c318603FFc8f39974e597b6af5e',
]
export const lockAddresses = addresses.map(address => address.toLowerCase())

export type OptionalBlockchainValues = Partial<PaywallState>

export interface BlockchainTestDefaults {
  fakeWindow: FetchWindow & SetTimeoutWindow
  walletService: WalletServiceType
  web3Service: Web3ServiceType
  emitError: (error: Error) => void
  emitChanges: () => void
  listeners: { [key: string]: Function }
  store: PaywallState
  constants: any
  configuration: PaywallConfig
}

export type PartialBlockchainTestDefaults = Partial<BlockchainTestDefaults>

export const defaultValuesOverride: OptionalBlockchainValues = {
  config: {
    locks: {
      // addresses are normalized by the time they reach the listeners
      [lockAddresses[0]]: { name: '1' },
      [lockAddresses[1]]: { name: '2' },
      [lockAddresses[2]]: { name: '3' },
    },
    callToAction: {
      default: '',
      expired: '',
      pending: '',
      confirmed: '',
      noWallet: '',
    },
  },
  account: null,
  balance: {},
  keys: {},
  locks: {},
  transactions: {},
  network: 1,
}

export function setupTestDefaults(
  valuesOverride: OptionalBlockchainValues = {
    config: {
      locks: {
        // addresses are normalized by the time they reach the listeners
        [lockAddresses[0]]: { name: '1' },
        [lockAddresses[1]]: { name: '2' },
        [lockAddresses[2]]: { name: '3' },
      },
      callToAction: {
        default: '',
        expired: '',
        pending: '',
        confirmed: '',
        noWallet: '',
      },
    },
    account: null,
    balance: {},
    keys: {},
    locks: {},
    transactions: {},
    network: 1,
  },
  jsonToFetch: { transactions?: LocksmithTransactionsResult[] } = {}
): BlockchainTestDefaults {
  const result: PartialBlockchainTestDefaults = {}
  result.fakeWindow = new FakeWindow()
  ;(result.fakeWindow as FakeWindow).setupTransactionsResult(jsonToFetch)
  result.listeners = {}
  result.constants = {
    requiredConfirmations: 12,
    locksmithUri: 'http://fun.times',
    unlockAddress: '0x123',
    blockTime: 5000,
    readOnlyProvider: 'http://readonly',
    defaultNetwork: 1984,
  }
  result.emitChanges = jest.fn()
  result.emitError = jest.fn()
  result.walletService = getWalletService(result.listeners)
  result.web3Service = getWeb3Service(result.listeners)
  const thisStore: PaywallState = {
    config: {
      locks: {
        // addresses are not normalized yet
        [addresses[0]]: { name: '1' },
        [addresses[1]]: { name: '2' },
        [addresses[2]]: { name: '3' },
      },
      callToAction: {
        default: '',
        expired: '',
        pending: '',
        confirmed: '',
        noWallet: '',
      },
    },
    account: null,
    balance: {},
    keys: {},
    locks: {},
    transactions: {},
    network: 1,
    ...valuesOverride,
  }

  result.store = { ...thisStore }
  result.store.transactions = {}
  result.store.locks = {}
  result.store.keys = {}
  result.configuration = result.store.config
  return result as BlockchainTestDefaults
}

type KeyExpirationOverrides = {
  [key: string]: number
}

export function getDefaultFullLocks(
  store: PaywallState,
  _: PaywallConfig,
  keyExpirations: KeyExpirationOverrides = {}
): Locks {
  return {
    [lockAddresses[0]]: {
      address: lockAddresses[0],
      key: {
        confirmations: 0,
        expiration: keyExpirations[lockAddresses[0]] || -1,
        lock: lockAddresses[0],
        owner: store.account,
        status: 'none',
        transactions: [],
      },
      name: 'one',
      keyPrice: '0',
      expirationDuration: 1,
      currencyContractAddress: null,
    },
    [lockAddresses[1]]: {
      address: lockAddresses[1],
      key: {
        confirmations: 0,
        expiration: keyExpirations[lockAddresses[1]] || -1,
        lock: lockAddresses[1],
        owner: store.account,
        status: 'none',
        transactions: [],
      },
      name: 'two',
      keyPrice: '0',
      expirationDuration: 1,
      currencyContractAddress: null,
    },
    [lockAddresses[2]]: {
      address: lockAddresses[2],
      key: {
        confirmations: 0,
        expiration: keyExpirations[lockAddresses[2]] || -1,
        lock: lockAddresses[2],
        owner: store.account,
        status: 'none',
        transactions: [],
      },
      name: 'three',
      keyPrice: '0',
      expirationDuration: 1,
      currencyContractAddress: null,
    },
  }
}

const firstLockAddress = lockAddresses[0]
export const firstLockLocked: Lock = {
  address: firstLockAddress,
  name: 'The First Lock',
  expirationDuration: 5,
  keyPrice: '1',
  key: {
    status: 'none',
    confirmations: 0,
    expiration: 0,
    transactions: [],
    owner: accountAddress,
    lock: firstLockAddress,
  },
  currencyContractAddress: addresses[2],
}

export const firstLockSubmitted: Lock = {
  ...firstLockLocked,
  key: {
    ...firstLockLocked.key,
    status: 'submitted',
    transactions: [
      {
        status: TransactionStatus.SUBMITTED,
        confirmations: 0,
        hash: 'hash',
        type: TransactionType.KEY_PURCHASE,
        blockNumber: Number.MAX_SAFE_INTEGER,
      },
    ],
  },
}

const secondLockAddress = lockAddresses[1]
export const secondLockLocked: Lock = {
  address: secondLockAddress,
  name: 'The Second Lock',
  expirationDuration: 5,
  keyPrice: '1',
  key: {
    status: 'expired',
    confirmations: 1678234,
    expiration: 163984,
    transactions: [
      {
        status: TransactionStatus.MINED,
        confirmations: 1678234,
        hash: 'hash',
        type: TransactionType.KEY_PURCHASE,
        blockNumber: 123,
      },
    ],
    owner: accountAddress,
    lock: secondLockAddress,
  },
  currencyContractAddress: addresses[2],
}

export const blockchainDataNoLocks: BlockchainData = {
  account: accountAddress,
  balance: {
    eth: '234',
  },
  network: 1984,
  locks: {},
  keys: {},
  transactions: {},
}

export const blockchainDataLocked: BlockchainData = {
  ...blockchainDataNoLocks,
  locks: {
    [firstLockAddress]: firstLockLocked,
    [secondLockAddress]: secondLockLocked,
  },
  keys: {
    [firstLockAddress]: firstLockLocked.key,
    [secondLockAddress]: secondLockLocked.key,
  },
  transactions: {
    hash: secondLockLocked.key.transactions[0],
  },
}

export const blockchainDataUnlocked: BlockchainData = {
  ...blockchainDataNoLocks,
  locks: {
    [firstLockAddress]: firstLockSubmitted,
  },
  keys: {
    [firstLockAddress]: firstLockSubmitted.key,
  },
  transactions: {
    hash: firstLockSubmitted.key.transactions[0],
  },
}
