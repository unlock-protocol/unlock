import type { ethers } from 'ethers'
import type { HardhatEthersHelpers } from '@nomiclabs/hardhat-ethers/types'
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
    // We omit the ethers field because it is redundant.
    ethers: typeof ethers & HardhatEthersHelpers
  }
}
