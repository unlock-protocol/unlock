import { DelayedPurchase } from '../unlockTypes'

export type Action =
  | SetPurchasingLockAddress
  | SetTransactionHash
  | SetDelayedPurchase

interface SetPurchasingLockAddress {
  kind: 'setPurchasingLockAddress'
  address: string
}

export const setPurchasingLockAddress = (
  address: string
): SetPurchasingLockAddress => ({
  kind: 'setPurchasingLockAddress',
  address,
})

interface SetTransactionHash {
  kind: 'setTransactionHash'
  hash: string
}

export const setTransactionHash = (hash: string): SetTransactionHash => ({
  kind: 'setTransactionHash',
  hash,
})

interface SetDelayedPurchase {
  kind: 'setDelayedPurchase'
  purchase: DelayedPurchase
}

export const setDelayedPurchase = (
  purchase: DelayedPurchase
): SetDelayedPurchase => ({
  kind: 'setDelayedPurchase',
  purchase,
})
