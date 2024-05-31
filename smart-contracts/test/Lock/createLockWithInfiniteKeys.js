const assert = require('assert')
const { ethers } = require('hardhat')
const {
  ADDRESS_ZERO,
  MAX_UINT,
  deployContracts,
  compareBigNumbers,
} = require('../helpers')
const {
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')

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
        ethers.parseUnits('1', 'ether'), // keyPrice: in wei
        MAX_UINT, // maxNumberOfKeys
        'Infinite Keys Lock', // name
      ]
      const calldata = await createLockCalldata({ args })
      const tx = await unlock.createUpgradeableLock(calldata)
      const receipt = await tx.wait()
      const {
        args: { newLockAddress },
      } = await getEvent(receipt, 'NewLock')
      let publicLock = await ethers.getContractAt(
        'contracts/PublicLock.sol:PublicLock',
        newLockAddress
      )
      const maxNumberOfKeys = await publicLock.maxNumberOfKeys()
      assert.equal(maxNumberOfKeys, MAX_UINT)
    })
  })

  describe('Create a Lock with 0 keys', () => {
    it('should have created the lock with 0 keys', async () => {
      const args = [
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        ADDRESS_ZERO,
        ethers.parseUnits('1', 'ether'), // keyPrice: in wei
        0, // maxNumberOfKeys
        'Zero-Key Lock',
        // '0x000000000000000000000001',
      ]
      const calldata = await createLockCalldata({ args })
      const tx = await unlock.createUpgradeableLock(calldata)

      const receipt = await tx.wait()
      const {
        args: { newLockAddress },
      } = await getEvent(receipt, 'NewLock')
      let publicLock = await ethers.getContractAt(
        'contracts/PublicLock.sol:PublicLock',
        newLockAddress
      )
      compareBigNumbers(await publicLock.maxNumberOfKeys(), 0)
    })
  })
})
