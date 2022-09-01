import 'hardhat/types/config'
import 'hardhat/types/runtime'

import { UnlockHRE } from './Unlock'
import { UnlockNetworkConfigs } from './types'

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
