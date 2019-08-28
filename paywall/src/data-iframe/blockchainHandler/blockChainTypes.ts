import { EventEmitter } from 'events'
import {
  Balance,
  RawLock,
  PaywallConfig,
  Transactions,
  RawLocks,
  Locks,
} from '../../unlockTypes'

type Web3ProviderType = string | Object

export interface WalletServiceType extends EventEmitter {
  ready: boolean
  provider?: any
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

export interface Web3ServiceType extends EventEmitter {
  refreshAccountBalance: ({ address }: { address: string }) => Promise<string>
  getTransaction: (
    transactionHash: string,
    defaults?: TransactionDefaults
  ) => Promise<void>
  getLock: (address: string) => Promise<RawLock>
  getKeyByLockForOwner: (lock: string, owner: string) => Promise<KeyResult>
}

export interface TransactionDefaults {
  hash: string
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
  locks: Locks
  account: string | null
  balance: Balance
  network: unlockNetworks
  keys: KeyResults
  transactions: Transactions
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
  fetch: (
    url: string,
    options?: {
      method: 'POST'
      mode: 'cors'
      headers: {
        'Content-Type': 'application/json'
      }
      body: string
    }
  ) => Promise<FetchResult>
}

export interface SetTimeoutWindow {
  setTimeout: (cb: Function, delay?: number) => number
}

export interface PaywallState {
  config: PaywallConfig
  keys: KeyResults
  locks: RawLocks
  transactions: Transactions
  account: string | null
  network: unlockNetworks
  balance: Balance
}
