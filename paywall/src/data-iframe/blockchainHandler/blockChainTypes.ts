import { EventEmitter } from 'events'
import {
  RawLock,
  PaywallConfig,
  Transactions,
  RawLocks,
} from '../../unlockTypes'

type Web3ProviderType = string | Object

export interface WalletServiceType extends EventEmitter {
  ready: boolean
  connect: (provider: Web3ProviderType) => Promise<void>
  getAccount: () => Promise<string | false>
  purchaseKey: (
    lock: string,
    owner: string,
    keyPrice: string,
    account: any,
    data: any,
    erc20Address: string | null
  ) => Promise<string>
}

export interface TransactionDefaults {
  to: string
  from: string
  input: string | null
  [key: string]: any
}

export interface KeyResult {
  lock: string
  owner: string | null
  expiration: number
}

export type KeyResults = { [key: string]: KeyResult }

export interface Web3ServiceType extends EventEmitter {
  refreshAccountBalance: (account: string) => Promise<string>
  getTransaction: (
    transactionHash: string,
    defaults?: TransactionDefaults
  ) => void
  getLock: (address: string) => Promise<RawLock>
  getKeyByLockForOwner: (lock: string, owner: string) => Promise<KeyResult>
}

export type unlockNetworks = 1 | 4 | 1984

export interface ConstantsType {
  unlockAddress: string
  blockTime: number
  requiredConfirmations: number
  locksmithHost: string
  readOnlyProvider: string
  defaultNetwork: unlockNetworks
}

export interface BlockchainData {
  locks: RawLocks
  account: string | null
  balance: string
  network: unlockNetworks
}

export interface LocksmithTransactionsResult {
  transactionHash: string
  chain: unlockNetworks
  recipient: string
  data: string | null
  sender: string
  for: string
}

export interface FetchResult {
  json: () => Promise<any>
}

export interface FetchWindow {
  fetch: (url: string) => Promise<FetchResult>
}

export interface BlockchainValues {
  config: PaywallConfig
  keys: KeyResults
  locks: RawLocks
  transactions: Transactions
  account: string | null
  network: unlockNetworks
  balance: string
}
