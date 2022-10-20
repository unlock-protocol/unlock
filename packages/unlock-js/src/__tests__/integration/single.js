import locks from '../helpers/fixtures/locks'
import nodeSetup from '../setup/prepare-eth-node-for-unlock'
import { chainId, setupTest, setupLock } from '../helpers/integration'

// Increasing timeouts
jest.setTimeout(3000000)

const unlockVersion = process.env.UNLOCK_JS_JEST_RUN_UNLOCK_VERSION || 'v11'
const publicLockVersion =
  process.env.UNLOCK_JS_JEST_RUN_PUBLIC_LOCK_VERSION || 'v11'
const testName = process.env.UNLOCK_JS_JEST_RUN_TEST_PATH

console.log('running test for:', {
  unlockVersion,
  publicLockVersion,
  testName,
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

  if (['v4'].indexOf(unlockVersion) === -1) {
    describe(
      `configuration using PublicLock ${publicLockVersion}`,
      unlockConfig({ publicLockVersion })
    )
  }

  describe(`using Lock ${publicLockVersion}`, () => {
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
      const testDescribe = require(testName)
      describe(testName, testDescribe.default(testSetupArgs))
    })
  })
})
