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
  
  key?: string
}

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

export interface Metadata {
  href: string
  readableName: string
}

export interface TransactionMetadata {
  [hash: string]: Metadata
}

export interface ChainExplorerURLBuilders {
  [site: string]: (address: string) => string
}
