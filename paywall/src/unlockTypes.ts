// This file contains type definitions for the various kinds of data that we use
// throughout unlock-app.

// A bug in eslint causes it to think that this exported enum is "unused". So
// disable eslint for that declaration until they fix it. TODO: follow up on this.
/* eslint-disable no-unused-vars */
export enum TransactionType {
  LOCK_CREATION = 'LOCK_CREATION',
  KEY_PURCHASE = 'KEY_PURCHASE',
  WITHDRAWAL = 'WITHDRAWAL',
  UPDATE_KEY_PRICE = 'UPDATE_KEY_PRICE',
}
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
export enum TransactionStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  MINED = 'mined',
  STALE = 'stale',
  FAILED = 'failed',
  NONE = '', // for testing purposes
}
/* eslint-enable no-unused-vars */

export interface Transaction {
  status: TransactionStatus
  confirmations: number
  hash: string
  type: TransactionType
  blockNumber: number

  createdAt?: Date
  to?: string
  for?: string
  from?: string
  lock?: string
  name?: string
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
  icon?: string
  unlockUserAccounts?: true | 'true' | false
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

// Mapping if currency: amount
export interface Balance {
  [currency: string]: string
}
export interface Locks {
  [address: string]: Lock
}

export interface RawLocks {
  [address: string]: RawLock
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
