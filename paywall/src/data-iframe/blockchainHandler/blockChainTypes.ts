import { Web3Service, WalletService } from '@unlock-protocol/unlock-js'
import {
  Balance,
  PaywallConfig,
  Transactions,
  RawLocks,
  Locks,
} from '../../unlockTypes'

// Maintaining this alias to avoid having to touch every test file
export type WalletServiceType = WalletService

export type Web3ServiceType = Web3Service

export interface PurchaseKeyParams {
  lockAddress: string
  owner: string
  keyPrice: string
  erc20Address: string | null
}

export interface TransactionDefaults {
  hash: string
  to: string
  from: string
  input: string | null
  [key: string]: any
}

// TODO: move these types to unlockTypes with other ones!
export interface KeyResult {
  lock: string
  owner: string | null
  expiration: number
}

export type KeyResults = { [key: string]: KeyResult }

export type unlockNetworks = number

export interface ConstantsType {
  unlockAddress: string
  blockTime: number
  requiredConfirmations: number
  defaultNetwork: unlockNetworks
  readOnlyProvider: string
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
  createdAt: string
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
