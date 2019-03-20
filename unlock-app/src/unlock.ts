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
  balance: string
}

export interface Network {
  name: number
}

// TransactionMetadata and TransactionMetadataMap are used in the log page to
// pass additional information about transactions that do not belong in the
// state.
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
