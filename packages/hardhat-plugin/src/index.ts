import '@nomiclabs/hardhat-ethers'
import '@openzeppelin/hardhat-upgrades'
import { task, extendEnvironment, extendConfig, types } from 'hardhat/config'
import { HardhatConfig, HardhatUserConfig } from 'hardhat/types'
import { lazyObject } from 'hardhat/plugins'
import './type-extensions'

import { TASK_CREATE_LOCK, TASK_DEPLOY_PROTOCOL } from './constants'

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
    config.unlock = { ...networks, ...userConfig.unlock }
  }
)

// TASKS
task(TASK_CREATE_LOCK)
  .addParam('name', 'The name of your lock')
  .addParam(
    'keyPrice',
    'Price of each key (in wei / max decimals)',
    undefined,
    types.int
  )
  .addParam(
    'expirationDuration',
    'Duration of each key (in seconds)',
    undefined,
    types.int
  )
  .addParam(
    'currencyContractAddress',
    '0x address for ETh or ERC20 contract address'
  )
  .addParam('maxNumberOfKeys', 'maximum number of keys', undefined, types.int)
  .addOptionalParam(
    'unlockContract',
    'The address of the Unlock instance to use'
  )
  .setAction(deployLockTask)

task(TASK_DEPLOY_PROTOCOL)
  .addOptionalParam(
    'unlockVersion',
    'The version number of the Unlock contract (default to latest)'
  )
  .addOptionalParam(
    'lockVersion',
    'The version number of the Lock template (default to latest)'
  )
  .addOptionalParam(
    'confirmations',
    'The number of confirmationsto wait (default 5)'
  )
  .setAction(deployLockTask)
