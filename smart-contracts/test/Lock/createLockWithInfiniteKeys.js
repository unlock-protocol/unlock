const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  ADDRESS_ZERO,
  MAX_UINT,
  deployContracts,
  compareBigNumbers,
} = require('../helpers')
const { createLockCalldata } = require('@unlock-protocol/hardhat-helpers')

let unlock

describe('Lock / createLockWithInfiniteKeys', () => {
  before(async () => {
    ;({ unlock } = await deployContracts())
  })

  describe('Create a Lock with infinite keys', () => {
    it('should have created the lock with an infinite number of keys', async () => {
      const args = [
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        ADDRESS_ZERO, // token address
        ethers.utils.parseUnits('1', 'ether').toString(), // keyPrice: in wei
        MAX_UINT, // maxNumberOfKeys
        'Infinite Keys Lock', // name
      ]
      const calldata = await createLockCalldata({ args })
      const tx = await unlock.createUpgradeableLock(calldata)
      const { events } = await tx.wait()
      const {
        args: { newLockAddress },
      } = events.find(({ event }) => event === 'NewLock')
      let publicLock = await ethers.getContractAt('PublicLock', newLockAddress)
      const maxNumberOfKeys = await publicLock.maxNumberOfKeys()
      assert.equal(maxNumberOfKeys.toString(), MAX_UINT)
    })
  })

  describe('Create a Lock with 0 keys', () => {
    it('should have created the lock with 0 keys', async () => {
      const args = [
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        ADDRESS_ZERO,
        ethers.utils.parseUnits('1', 'ether').toString(), // keyPrice: in wei
        0, // maxNumberOfKeys
        'Zero-Key Lock',
        // '0x000000000000000000000001',
      ]
      const calldata = await createLockCalldata({ args })
      const tx = await unlock.createUpgradeableLock(calldata)

      const { events } = await tx.wait()
      const {
        args: { newLockAddress },
      } = events.find(({ event }) => event === 'NewLock')
      let publicLock = await ethers.getContractAt('PublicLock', newLockAddress)
      compareBigNumbers(await publicLock.maxNumberOfKeys(), 0)
    })
  })
})
