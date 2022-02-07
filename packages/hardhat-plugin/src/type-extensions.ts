import { NetworkConfig } from '@unlock-protocol/types'
import 'hardhat/types/config'
import 'hardhat/types/runtime'

import { UnlockHRE } from './Unlock'

interface UnlockNetworkConfig extends NetworkConfig {
  id?: number
  name?: string
  provider?: string
  publicProvider?: string
}

interface UnlockNetworkConfigs {
  [networkId: string]: UnlockNetworkConfig
}
declare module 'hardhat/types/config' {
  export interface HardhatUserConfig {
    unlock?: UnlockNetworkConfigs
  }
  export interface HardhatConfig {
    unlock: UnlockNetworkConfigs
  }
}

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    unlock: UnlockHRE
  }
}
