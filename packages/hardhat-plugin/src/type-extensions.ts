import 'hardhat/types/config'
import 'hardhat/types/runtime'

// eslint-disable-next-line import/no-cycle
import { UnlockHRE, UnlockNetworkConfigs } from './Unlock'

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
