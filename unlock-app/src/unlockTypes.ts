// This file contains type definitions for the various kinds of data that we use
// throughout unlock-app.

import { Card } from '@stripe/stripe-js'

export enum TransactionType {
  LOCK_CREATION = 'Lock Creation',
  KEY_PURCHASE = 'Key Purchase',
  WITHDRAWAL = 'Withdrawal',
  UPDATE_KEY_PRICE = 'Update Key Price',
}

export enum TransactionStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  MINED = 'mined',
}

export enum KindOfModal {
  WalletCheckOverlay,
}

export interface Transaction {
  status: TransactionStatus
  confirmations: number
  hash: string
  lock: string
  name: string
  type: TransactionType
  blockNumber: number

  key?: string // TODO: tighten up our types, hopefully we won't have too many
  // optional properties.
}

// Analogous to the transactions in Redux
export interface Transactions {
  [hash: string]: Transaction
}

export interface Account {
  address: string
  balance: string // TODO: Stricter balance type (enforce currency, precision)
  // emailAddress will be present when a user account is being used, but not otherwise
  emailAddress?: string
  cards?: Card[]
}

export interface Network {
  name: number // TODO: This is very misleading, change property name to id
}
export interface Loading {
  loading: number
}

export interface Action {
  type: string
  [key: string]: any
}

export type Dispatch = (action: Action) => any

// This is currrently the way ethers checks the keystore format.
export interface EncryptedPrivateKey {
  version: number
  [param: string]: any
}

export interface Router {
  location: Location
}

export interface Error {
  name: string
  data?: {
    [key: string]: any
  }
}

export interface PaywallCallToAction {
  default: string
  expired: string
  pending: string
  confirmed: string
  noWallet: string
  metadata: string
  card: string
  quantity: string
  [name: string]: string
}

export interface PaywallConfigLocks {
  [address: string]: PaywallConfigLock
}

export interface PaywallConfigLock {
  name?: string
  network?: number
  metadataInputs?: MetadataInput[]
  secret?: string
  recurringPayments?: number
  captcha?: boolean
  maxRecipients?: number
  minRecipients?: number
  superfluid?: boolean
  password?: boolean
  default?: boolean
}

export enum KeyStatus {
  NONE = 'none',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  VALID = 'valid',
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  FAILED = 'failed',
}

export interface Lock {
  canGrant?: boolean
  name: string
  address: string
  network: number
  keyPrice: string
  expirationDuration: number
  key: Key
  currencyContractAddress: string | null
  asOf?: number
  maxNumberOfKeys?: number
  outstandingKeys?: number
  balance?: string
  owner?: string
  creationBlock?: number
  publicLockVersion?: number
  maxKeysPerAddress?: number
  selfAllowance?: string
}

export interface Locks {
  [address: string]: Lock
}

export interface Key {
  expiration: number
  transactions: Transaction[]
  status: string
  confirmations: number
  owner: string | null
  lock: string
}

export interface PurchaseKeyRequest {
  lock: string // lock address
  extraTip: string // extra value to add in addition to key price
}

export interface KeyMetadata {
  // These 3 properties are always present -- they come down from the graph as
  // strings
  lockName: string
  expiration: string
  keyholderAddress: string
  // Can have any other arbitrary properies, as long as the values are strings.
  [key: string]: string
}

// TODO: come up with one master type for the Redux store that we can
// import from every connected component

// Represents the keyholdersByLock GraphQL query result
export interface KeyholdersByLock {
  locks: {
    address: string
    name: string
    keys: {
      expiration: string
      keyId: string
      owner: {
        address: string
      }
    }[]
  }[]
}

export interface MetadataInput {
  name: string
  defaultValue?: string
  type: 'text' | 'date' | 'color' | 'email' | 'url'
  required: boolean
  placeholder?: string
  public?: true // optional, all non-public fields are treated as protected
}

export interface PaywallConfig {
  title?: string
  icon?: string
  callToAction?: Partial<PaywallCallToAction>
  locks: PaywallConfigLocks
  metadataInputs?: MetadataInput[]
  persistentCheckout?: boolean
  redirectUri?: string
  useDelegatedProvider?: boolean
  network?: number
  referrer?: string
  messageToSign?: string
  pessimistic?: boolean
  captcha?: boolean
  password?: boolean
  maxRecipients?: number
  minRecipients?: number
  superfluid?: boolean
}

export interface RawLock {
  name: string
  address: string
  keyPrice: string
  expirationDuration: number
  currencyContractAddress: string | null
  asOf?: number
  maxNumberOfKeys?: number
  outstandingKeys?: number
  balance?: string
  owner?: string
}

export interface Balances {
  eth: string
  [contractAddress: string]: string
}

export type MemberFilter = 'all' | 'active' | 'expired'

export interface UserMetadata {
  publicData?: {
    [key: string]: string
  }
  protectedData?: {
    [key: string]: string
  }
}

export interface DelayedPurchase {
  lockAddress: string
  purchaseKey: () => void
}
export interface OAuthConfig {
  clientId: string
  responseType: string
  state: string
  redirectUri: string
}
