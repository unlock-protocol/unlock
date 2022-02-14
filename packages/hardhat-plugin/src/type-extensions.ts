import type { ethers } from 'ethers'
import type { HardhatEthersHelpers } from '@nomiclabs/hardhat-ethers/types'
import type { HardhatUpgrades } from '@openzeppelin/hardhat-upgrades'

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
    ethers: typeof ethers & HardhatEthersHelpers
    upgrades: HardhatUpgrades
  }
}
