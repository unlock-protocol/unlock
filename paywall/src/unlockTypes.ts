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
  NONE = '', // for testing purposes
}
/* eslint-enable no-unused-vars */

export interface Transaction {
  status: TransactionStatus
  confirmations: number
  hash: string
  type: TransactionType
  blockNumber: number

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

export type PaywallAppKind = 'adblock' | 'paywall'

// This interface describes an individual paywall's config
export interface PaywallConfig {
  icon: string
  type: PaywallAppKind
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

// window sub-types

export interface EventWindow {
  CustomEvent: {
    // this is copy/paste from the .d.ts for window, because it
    // declares CustomEvent as an interface and exports it, but
    // also as a global variable, and the global variable is not
    // also exported in the definition of window.
    // So, calling new window.CustomEvent() fails, but
    // new CustomEvent() succeeds.
    prototype: CustomEvent
    new <T>(typeArg: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T>
  }
  document: {
    createEvent: (type: string) => CustomEvent
  }
  dispatchEvent: (event: CustomEvent) => void
}

export interface LocalStorageWindow {
  localStorage: Storage
}

export interface web3MethodCall {
  method: string
  params: any[]
  jsonrpc: '2.0'
  id: number
}

export type web3Callback = (error: Error | string | null, result: any) => void
export type web3Send = (
  methodCall: web3MethodCall,
  callback: web3Callback
) => void

export interface Web3Window extends PostOfficeWindow {
  web3?: {
    currentProvider: {
      sendAsync?: web3Send
      send?: web3Send
      isMetamask: true | undefined
    }
  }
}
export interface MessageEvent {
  source: any
  origin: string
  data: any
}

export type MessageHandler = (event: MessageEvent) => void

export interface PostOfficeWindow {
  addEventListener: (type: 'message', handler: MessageHandler) => void
}

export interface IframePostOfficeWindow extends PostOfficeWindow {
  parent: PostMessageTarget
  location: {
    href: string
  }
}

export interface PostMessageTarget {
  postMessage: (data: any, origin: string) => void
}

export interface IframeType {
  contentWindow: PostMessageTarget
}
