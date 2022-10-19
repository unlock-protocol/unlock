import locks from '../helpers/fixtures/locks'
import nodeSetup from '../setup/prepare-eth-node-for-unlock'
import UnlockVersions from '../../Unlock'

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

// Increasing timeouts
jest.setTimeout(3000000)

// Unlock versions to test
export const UnlockVersionNumbers = ['v4']
//  Object.keys(UnlockVersions).filter(
//   (v) => v !== 'v6' // 'v6' is disabled it required erc1820
// )

describe.each(UnlockVersionNumbers)('Unlock %s', (unlockVersion) => {
  let walletService
  let web3Service
  let ERC20
  let accounts

  // Unlock v4 can only interact w PublicLock v4
  const PublicLockVersions = ['v4']
  // unlockVersion === 'v4' // Unlock v4 can only interact w PublicLock v4
  //   ? ['v4']
  //   : Object.keys(locks).filter((v) => !['v4', 'v6'].includes(v))

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

      // lock tests
      describe('approveBeneficiary', approveBeneficiary(testSetupArgs))
      describe('grantKey', grantKey(testSetupArgs))
      describe('grantKeyExtension', grantKeyExtension(testSetupArgs))
      describe('grantKeys', grantKeys(testSetupArgs))
      describe('purchaseKey', purchaseKey(testSetupArgs))
      describe('purchaseKeys', purchaseKeys(testSetupArgs))
      describe('withdrawFromLock', withdrawFromLock(testSetupArgs))
      describe('cancelAndRefund', cancelAndRefund(testSetupArgs))
      describe('setMaxNumberOfKeys', setMaxNumberOfKeys(testSetupArgs))
      describe('setExpirationDuration', setExpirationDuration(testSetupArgs))
      describe('keyGranter', keyGranter(testSetupArgs))
      describe('expireAndRefundFor', expireAndRefundFor(testSetupArgs))
      describe('extendKey', extendKey(testSetupArgs))
      describe('maxKeysPerAddress', maxKeysPerAddress(testSetupArgs))
      describe('shareKey (to address)', shareKeyToAddress(testSetupArgs))
      describe('shareKey (to TokenId)', shareKeyToTokenId(testSetupArgs))
      describe('mergeKeys', mergeKeys(testSetupArgs))
      describe('updateKeyPrice', updateKeyPrice(testSetupArgs))
      describe('updateLockName', updateLockName(testSetupArgs))
      describe('updateLockSymbol', updateLockSymbol(testSetupArgs))
      describe('setBaseTokenURI', setBaseTokenURI(testSetupArgs))
    })
  })
})
