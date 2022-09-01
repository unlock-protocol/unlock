import type { Contract, BigNumber } from 'ethers'

import { NetworkConfig } from '@unlock-protocol/types'

// used to make type optional
type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P]
}

// make network info optional
export type UnlockNetworkConfig = PartialPick<
  NetworkConfig,
  | 'id'
  | 'name'
  | 'subgraphURI'
  | 'locksmithUri'
  | 'unlockAddress'
  | 'serializerAddress'
>

export interface UnlockNetworkConfigs {
  [networkId: string]: UnlockNetworkConfig
}

export interface UnlockProtocolContracts {
  unlock: Contract
  publicLock: Contract
}

export interface LockArgs {
  name: string
  keyPrice: string | number | BigNumber
  expirationDuration: number
  currencyContractAddress: string | null
  maxNumberOfKeys?: number
}

export interface UnlockConfigArgs {
  udtAddress?: string | null
  wethAddress?: string | null
  locksmithURI?: string
  chainId?: number
  estimatedGasForPurchase?: number
  symbol?: string
}
