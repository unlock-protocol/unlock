import 'hardhat/types/config'
import 'hardhat/types/runtime'

import { UnlockNetworkConfigs } from './types'
import type { HardhatUnlockPlugin } from '.'

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
    unlock: HardhatUnlockPlugin
  }
}
