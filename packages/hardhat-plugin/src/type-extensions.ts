import { NetworkConfigs } from '@unlock-protocol/types'
import 'hardhat/types/config'
import 'hardhat/types/runtime'

import { UnlockHRE } from './Unlock'

declare module 'hardhat/types/config' {
  export interface HardhatUserConfig {
    unlock?: NetworkConfigs
  }
  export interface HardhatConfig {
    unlock: NetworkConfigs
  }
}

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    unlock: UnlockHRE
  }
}
