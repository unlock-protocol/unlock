// This file contains type definitions for the various kinds of data that we use
// throughout unlock-app.

export enum TransactionType {
  LOCK_CREATION = 'LOCK_CREATION',
  KEY_PURCHASE  = 'KEY_PURCHASE',
  WITHDRAWAL    = 'WITHDRAWAL',
  UPDATE_KEY_PRICE = 'UPDATE_KEY_PRICE',
}

export interface Transaction {
  status: string
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

// TransactionMetadata and TransactionMetadataMap are used in the log page to
// pass additional information about transactions that do not belong in the
// state. TODO: There is certainly a better way to handle this, find out what
// that is and do it.
export interface TransactionMetadata {
  href: string
  readableName: string
}

export interface TransactionMetadataMap {
  [hash: string]: TransactionMetadata
}

export interface ChainExplorerURLBuilders {
  [site: string]: (address: string) => string
}
