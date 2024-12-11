import locks from '../helpers/fixtures/locks'
import nodeSetup from '../setup/prepare-eth-node-for-unlock'
import UnlockVersions from '../../Unlock'
import { describe, it, expect, beforeAll } from 'vitest'
import {
  chainId,
  setupTest,
  setupLock,
  versionEqualOrAbove,
} from '../helpers/integration'

global.suiteData = {
  chainId,
}

// This test suite will do the following:

// For each version of the Unlock contract
import unlockConfig from './unlock/unlockConfig'
import lockCreation from './unlock/lockCreation'

// For each lock version,
// we check that all walletService functions are working as expected!

import approveBeneficiary from './lock/approveBeneficiary'
import updateKeyPrice from './lock/updateKeyPrice'
import grantKey from './lock/grantKey'
import grantKeyExtension from './lock/grantKeyExtension'
import grantKeys from './lock/grantKeys'
import purchaseKey from './lock/purchaseKey'
import purchaseKeys from './lock/purchaseKeys'
import withdrawFromLock from './lock/withdrawFromLock'
import cancelAndRefund from './lock/cancelAndRefund'
import setMaxNumberOfKeys from './lock/setMaxNumberOfKeys'
import setExpirationDuration from './lock/setExpirationDuration'
import keyGranter from './lock/keyGranter'
import expireAndRefundFor from './lock/expireAndRefundFor'
import shareKeyToAddress from './lock/shareKeyToAddress'
import shareKeyToTokenId from './lock/shareKeyToTokenId'
import mergeKeys from './lock/mergeKeys'
import maxKeysPerAddress from './lock/maxKeysPerAddress'
import extendKey from './lock/extendKey'
import updateLockName from './lock/updateLockName'
import updateLockSymbol from './lock/updateLockSymbol'
import setBaseTokenURI from './lock/setBaseTokenURI'
import setEventHooks from './lock/setEventHooks'
import transferFrom from './lock/transferFrom'
import lendKey from './lock/lendKey'
import preparePurchaseKey from './lock/web3Service/purchaseKey'
import preparePurchaseKeys from './lock/web3Service/purchaseKeys'

// Unlock and PublicLock versions to test
export const UnlockVersionNumbers = Object.keys(UnlockVersions)
const PublicLockVersions = Object.keys(locks)

describe.each(UnlockVersionNumbers)('Unlock %s', (unlockVersion) => {
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

  // loop through PublicLock versions
  describe.each(PublicLockVersions)('using Lock %s', (publicLockVersion) => {
    beforeAll(async () => {
      global.suiteData = {
        ...global.suiteData,
        publicLockVersion,
      }
    })
    if (versionEqualOrAbove(unlockVersion, 'v5')) {
      describe.each(PublicLockVersions)(
        'configuration using PublicLock %s',
        () => {
          describe('config steps', unlockConfig())
        }
      )
    }

    // loop through locks
    describe.each(
      locks[publicLockVersion].map((lock, index) => [index, lock.name, lock])
    )('lock %i: %s', (lockIndex, lockName, lockParams) => {
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

      // wallet service lock tests
      approveBeneficiary(testSetupArgs)
      cancelAndRefund(testSetupArgs)
      expireAndRefundFor(testSetupArgs)
      extendKey(testSetupArgs)
      grantKey(testSetupArgs)
      grantKeyExtension(testSetupArgs)
      grantKeys(testSetupArgs)
      keyGranter(testSetupArgs)
      maxKeysPerAddress(testSetupArgs)
      mergeKeys(testSetupArgs)
      purchaseKey(testSetupArgs)
      purchaseKeys(testSetupArgs)
      setBaseTokenURI(testSetupArgs)
      setEventHooks(testSetupArgs)
      setExpirationDuration(testSetupArgs)
      setMaxNumberOfKeys(testSetupArgs)
      shareKeyToAddress(testSetupArgs)
      shareKeyToTokenId(testSetupArgs)
      updateKeyPrice(testSetupArgs)
      updateLockName(testSetupArgs)
      updateLockSymbol(testSetupArgs)
      withdrawFromLock(testSetupArgs)
      transferFrom(testSetupArgs)
      lendKey(testSetupArgs)

      // web3 service tx building tests
      preparePurchaseKey(testSetupArgs)
      preparePurchaseKeys(testSetupArgs)
    })
  })
})
