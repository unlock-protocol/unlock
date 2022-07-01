const { ethers } = require('hardhat')
const { assert } = require('chai')
const deployContracts = require('../fixtures/deploy')
const createLockHash = require('../helpers/createLockCalldata')
const {
  ADDRESS_ZERO,
  purchaseKey,
  purchaseKeys,
  reverts,
} = require('../helpers')

const keyPrice = ethers.utils.parseEther('0.01')

describe('Lock / setMaxNumberOfKeys', () => {
  let unlock
  let lock

  describe('update the number of keys available in a lock', () => {
    beforeEach(async () => {
      const { unlockEthers: unlockDeployed } = await deployContracts()
      unlock = unlockDeployed
      const [from] = await ethers.getSigners()

      // create a new lock
      const tokenAddress = ADDRESS_ZERO
      const args = [60 * 60 * 24 * 30, tokenAddress, keyPrice, 10, 'Test lock']

      const calldata = await createLockHash({ args, from: from.address })
      const tx = await unlock.createUpgradeableLock(calldata)
      const { events } = await tx.wait()
      const {
        args: { newLockAddress },
      } = events.find(({ event }) => event === 'NewLock')

      const PublicLock = await ethers.getContractFactory('PublicLock')
      lock = PublicLock.attach(newLockAddress)
    })

    it('should increase max number of keys', async () => {
      const [, ...buyers] = await ethers.getSigners()

      // buy 10 key
      await purchaseKeys(lock, 10)

      // try to buy another key exceding totalSupply
      await reverts(purchaseKey(lock, buyers[11].address), 'LOCK_SOLD_OUT')

      // increase supply
      await lock.setMaxNumberOfKeys(12)

      // actually buy the key
      const { to } = await purchaseKey(lock, buyers[11].address)

      assert.equal(to, buyers[11].address)
      assert.equal(await lock.maxNumberOfKeys(), 12)
    })

    it('should prevent from setting a value lower than total supply', async () => {
      // buy 10 keys
      await purchaseKeys(lock, 10)

      // increase supply
      await reverts(lock.setMaxNumberOfKeys(5), 'SMALLER_THAN_SUPPLY')
    })

    it('should allow setting a value equal to current total supply', async () => {
      // buy 10 keys
      const [, ...buyers] = await ethers.getSigners()
      await purchaseKeys(lock, 10)

      // set max keys to total supply
      const totalSupply = await lock.totalSupply()
      await lock.setMaxNumberOfKeys(totalSupply)
      assert.equal(
        (await lock.maxNumberOfKeys()).toString(),
        totalSupply.toString()
      )

      // try to buy another key exceding totalSupply
      await reverts(purchaseKey(lock, buyers[11].address), 'LOCK_SOLD_OUT')
    })
  })
})
