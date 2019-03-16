// This file contains type definitions for the various kinds of data that we use
// throughout unlock-app.

export enum TransactionType {
  LOCK_CREATION = 'LOCK_CREATION',
  KEY_PURCHASE  = 'KEY_PURCHASE',
  WITHDRAWAL    = 'WITHDRAWAL',
  UPDATE_KEY_PRICE = 'UPDATE_KEY_PRICE',
}

export interface Transaction {
  status: string,
  confirmations: number,
  createdAt: number,
  hash: string,
  lock: string,
  name: string,
  type: TransactionType,
}
