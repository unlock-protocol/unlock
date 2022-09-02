/* eslint-disable @typescript-eslint/no-var-requires */
import '@nomiclabs/hardhat-ethers'
import { task, extendEnvironment, extendConfig, types } from 'hardhat/config'
import { HardhatConfig, HardhatUserConfig } from 'hardhat/types'
import { lazyObject } from 'hardhat/plugins'
import './type-extensions'

import { TASK_CREATE_LOCK, TASK_DEPLOY_PROTOCOL } from './constants'

import { deployLockTask } from './tasks'
import networks from './networks.json'

// types
import { UnlockNetworkConfigs } from './types'
import type { CreateLockFunction } from './createLock'
import type { DeployProtocolFunction } from './deployProtocol'
import type { GetLockVersionFunction } from './getLockVersion'
import type { GetUnlockContractFunction } from './getUnlockContract'
import type { GetLockContractFunction } from './getLockContract'

export interface HardhatUnlockPlugin {
  createLock: CreateLockFunction
  getLockVersion: GetLockVersionFunction
  deployProtocol: DeployProtocolFunction
  getLockContract: GetLockContractFunction
  getUnlockContract: GetUnlockContractFunction
  networks: UnlockNetworkConfigs
}

extendEnvironment((hre) => {
  hre.unlock = lazyObject(() => {
    const { createLock } = require('./createLock')
    const { deployProtocol } = require('./deployProtocol')
    const { getLockVersion } = require('./getLockVersion')
    const { getUnlockContract } = require('./getUnlockContract')
    const { getLockContract } = require('./getLockContract')
    return {
      networks,
      createLock,
      deployProtocol,
      getLockVersion,
      getUnlockContract,
      getLockContract,
    }
  })
})

// add unlock networks to config
extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const { unlock } = userConfig
    const merged: UnlockNetworkConfigs = networks
    // merge configs
    if (unlock) {
      Object.entries(unlock).forEach(([key]) => {
        if (key) {
          // new network in user config
          if (!merged[key as keyof typeof networks]) {
            Object.assign(networks, { [key]: unlock[key] })
          } else {
            // existing network in both configs
            merged[key as keyof UnlockNetworkConfigs] = {
              ...Object(networks[key as keyof typeof networks]),
              ...unlock[key],
            }
          }
        }
      })
    }
    config.unlock = merged
    return config
  }
)

// TASKS
task(TASK_CREATE_LOCK, 'Create a lock')
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

task(TASK_DEPLOY_PROTOCOL, 'Deploy and set the entire Unlock Protocol')
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
