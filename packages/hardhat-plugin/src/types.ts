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
