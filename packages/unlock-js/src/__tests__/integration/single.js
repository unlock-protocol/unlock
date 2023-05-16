/**
 * This is a helper to run a single test file against specific lock/unlock version
 * The easiest way to use it is throuhg the hardhat cli
 *
 * Usage:
 *
 * 1. mv single.js single.test.js
 * 2. edit `testPath` value
 * 3. yarn vitest
 * */
import locks from '../helpers/fixtures/locks'
import nodeSetup from '../setup/prepare-eth-node-for-unlock'
import { describe, it, expect, beforeAll } from 'vitest'

import {
  chainId,
  setupTest,
  setupLock,
  versionEqualOrAbove,
} from '../helpers/integration'

const unlockVersion = process.env.UNLOCK_JS_TEST_RUN_UNLOCK_VERSION || 'v12'
const publicLockVersion =
  process.env.UNLOCK_JS_TEST_RUN_PUBLIC_LOCK_VERSION || 'v13'
const testPath =
  process.env.UNLOCK_JS_TEST_RUN_TEST_PATH || './lock/cancelAndRefund.js'

// parse describe info from file name
const testName = testPath
  .split('/')
  [testPath.split('/').length - 1].replace('.js', '')

console.log('running test for:', {
  unlockVersion,
  publicLockVersion,
  testName,
  testPath,
})

// Unlock contract
import unlockConfig from './unlock/unlockConfig'
import lockCreation from './unlock/lockCreation'

global.suiteData = {
  chainId,
}

describe(`Unlock ${unlockVersion}`, () => {
  let walletService
  let web3Service
  let ERC20
  let accounts

  beforeAll(async () => {
    // deploy ERC20 and set balances
    ERC20 = await nodeSetup()
    ;({ accounts, walletService, web3Service } = await setupTest(unlockVersion))
    global.suiteData = {
      ...global.suiteData,
      web3Service,
      walletService,
      accounts,
      unlockVersion,
      publicLockVersion,
    }
  })

  it('should yield true to isUnlockContractDeployed', async () => {
    expect.assertions(1)
    expect(await walletService.isUnlockContractDeployed(chainId)).toBe(true)
  })

  it('should return the right version for unlockContractAbiVersion', async () => {
    expect.assertions(1)
    const abiVersion = await walletService.unlockContractAbiVersion()
    expect(abiVersion.version).toEqual(unlockVersion)
  })

  describe(`using PublicLock ${publicLockVersion}`, () => {
    if (versionEqualOrAbove(unlockVersion, 'v5')) {
      describe(`configuration`, unlockConfig({ publicLockVersion }))
    }

    describe.each(
      locks[publicLockVersion].map((lock, index) => [index, lock.name, lock])
    )('lock %i: %s', async (lockIndex, lockName, lockParams) => {
      let lock
      let lockAddress
      let lockCreationHash

      beforeAll(async () => {
        ;({ lock, lockAddress, lockCreationHash } = await setupLock({
          walletService,
          web3Service,
          publicLockVersion,
          unlockVersion,
          lockParams,
          ERC20,
        }))
        global.suiteData = {
          ...global.suiteData,
          lock,
          lockAddress,
          lockCreationHash,
          walletService,
          web3Service,
          publicLockVersion,
          unlockVersion,
          lockParams,
          ERC20,
        }
      })

      // to setup tests, we use a generator function that takes the following params
      const testSetupArgs = { publicLockVersion, isERC20: lockParams.isERC20 }

      // make sure everything is ok
      describe('lock creation', lockCreation(testSetupArgs))

      // lock tests
      const testDescribe = await import(testPath)
      describe(testName, testDescribe.default(testSetupArgs))
    })
  })
})
