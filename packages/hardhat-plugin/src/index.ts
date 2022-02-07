import '@nomiclabs/hardhat-ethers'
import '@openzeppelin/hardhat-upgrades'
import { task, extendEnvironment, extendConfig } from 'hardhat/config'
import { HardhatConfig, HardhatUserConfig } from 'hardhat/types'
import { lazyObject } from 'hardhat/plugins'
import './type-extensions'

import { TASK_DEPLOY_LOCK } from './constants'

import { UnlockHRE } from './Unlock'
import { deployLockTask } from './tasks'
import networks from './networks.json'

extendEnvironment((hre) => {
  hre.unlock = lazyObject(() => {
    const unlock = new UnlockHRE(hre)
    return unlock
  })
})

// add unlock networks to config
extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.unlock = Object.assign({}, networks, userConfig.unlock)
  }
)
task(TASK_DEPLOY_LOCK)
  .addParam('name', 'The name of your lock')
  .setAction(deployLockTask)
