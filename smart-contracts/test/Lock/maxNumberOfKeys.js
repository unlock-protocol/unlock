const { ethers } = require('hardhat')
const assert = require('assert')
const deployContracts = require('../fixtures/deploy')
const {
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')
const {
  ADDRESS_ZERO,
  purchaseKey,
  purchaseKeys,
  reverts,
} = require('../helpers')

const keyPrice = ethers.parseEther('0.01')

describe('Lock / maxNumberOfKeys', () => {
  let unlock
  let lock

  describe('prevent from buying more keys than defined supply', () => {
    beforeEach(async () => {
      const { unlock: unlockDeployed } = await deployContracts()
      unlock = unlockDeployed
      const [from] = await ethers.getSigners()

      // create a new lock
      const tokenAddress = ADDRESS_ZERO
      const args = [60 * 60 * 24 * 30, tokenAddress, keyPrice, 10, 'Test lock']

      const calldata = await createLockCalldata({
        args,
        from: await from.getAddress(),
      })
      const tx = await unlock.createUpgradeableLock(calldata)
      const receipt = await tx.wait()
      const {
        args: { newLockAddress },
      } = await getEvent(receipt, 'NewLock')

      const PublicLock = await ethers.getContractFactory(
        'contracts/PublicLock.sol:PublicLock'
      )
      lock = PublicLock.attach(newLockAddress)
    })

    it('should prevent from buying more keys from defined', async () => {
      const [, ...buyers] = await ethers.getSigners()

      // buy 10 key
      await purchaseKeys(lock, 10)

      // try to buy another key exceding totalSupply
      await reverts(
        purchaseKey(lock, await buyers[11].getAddress()),
        'LOCK_SOLD_OUT'
      )

      // increase supply
      await lock.updateLockConfig(
        await lock.expirationDuration(),
        12,
        await lock.maxKeysPerAddress()
      )

      // actually buy the key
      const { to } = await purchaseKey(lock, await buyers[11].getAddress())

      assert.equal(to, await buyers[11].getAddress())
      assert.equal(await lock.maxNumberOfKeys(), 12)
    })
  })
})
