// This file contains type definitions for the various kinds of data that we use
// throughout unlock-app.

// A bug in eslint causes it to think that this exported enum is "unused". So
// disable eslint for that declaration until they fix it. TODO: follow up on this.
/* eslint-disable no-unused-vars */
export enum TransactionType {
  LOCK_CREATION = 'Lock Creation',
  KEY_PURCHASE = 'Key Purchase',
  WITHDRAWAL = 'Withdrawal',
  UPDATE_KEY_PRICE = 'Update Key Price',
}
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
export enum TransactionStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  MINED = 'mined',
}
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
export enum KindOfModal {
  WalletCheckOverlay,
  PasswordPrompt,
  ResetPasswordPrompt,
}
/* eslint-enable no-unused-vars */

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
}

export interface Network {
  name: number // TODO: This is very misleading, change property name to id
}

export interface ChainExplorerURLBuilders {
  [site: string]: (address: string) => string
}

export interface Loading {
  loading: number
}

export interface Action {
  type: string
  [key: string]: any
}

// TODO: Use this where we have TS files
export type Dispatch = (action: Action) => any

// This is currrently the way ethers checks the keystore format. TODO:
// tighten this up? At the moment it just serves to make it difficult
// to put a decrypted key into the state.
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
}

export interface PaywallConfigLocks {
  [address: string]: PaywallConfigLock
}

export interface PaywallConfigLock {
  name: string
}

// This interface describes an individual paywall's config
export interface PaywallConfig {
  icon: string
  callToAction: PaywallCallToAction
  locks: PaywallConfigLocks
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
  name: string
  address: string
  keyPrice: string
  expirationDuration: number
  key: Key
  currencyContractAddress: string | null
  asOf?: number
  maxNumberOfKeys?: number
  outstandingKeys?: number
  balance?: string
  owner?: string
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
