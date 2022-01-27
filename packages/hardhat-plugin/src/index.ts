import '@nomiclabs/hardhat-ethers'
import { task, extendEnvironment } from 'hardhat/config'
import { lazyObject } from 'hardhat/plugins'
import './type-extensions'

import { TASK_DEPLOY_LOCK } from './constants'

import { UnlockHRE } from './Unlock'
import { deployLockTask } from './tasks'

extendEnvironment((hre) => {
  hre.unlock = lazyObject(() => new UnlockHRE())
})

task(TASK_DEPLOY_LOCK)
  .addParam('name', 'The name of your lock')
  .setAction(deployLockTask)
