import { PaywallConfig, DelayedPurchase } from '../unlockTypes'

export type Action =
  | SetConfig
  | SetShowingLogin
  | SetPurchasingLockAddress
  | SetTransactionHash
  | SetShowingMetadataForm
  | SetDelayedPurchase

interface SetConfig {
  kind: 'setConfig'
  config: PaywallConfig
}

export const setConfig = (config: PaywallConfig): SetConfig => ({
  kind: 'setConfig',
  config,
})

interface SetShowingLogin {
  kind: 'setShowingLogin'
  value: boolean
}

export const setShowingLogin = (value: boolean): SetShowingLogin => ({
  kind: 'setShowingLogin',
  value,
})

interface SetShowingMetadataForm {
  kind: 'setShowingMetadataForm'
  value: boolean
}

export const setShowingMetadataForm = (
  value: boolean
): SetShowingMetadataForm => ({
  kind: 'setShowingMetadataForm',
  value,
})

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
