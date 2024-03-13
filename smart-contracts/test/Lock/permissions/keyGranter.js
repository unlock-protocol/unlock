const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  deployLock,
  reverts,
  KEY_GRANTER_ROLE,
  LOCK_MANAGER_ROLE,
} = require('../../helpers')

let lock
let lockCreator, notAuthorized, newKeyGranter

describe('Permissions / KeyGranter', () => {
  before(async () => {
    ;[lockCreator, notAuthorized, newKeyGranter] = await ethers.getSigners()
    lock = await deployLock()
  })

  describe('default permissions on a new lock', () => {
    it('should add the lock creator to the keyGranter role', async () => {
      assert.equal(
        await lock.hasRole(KEY_GRANTER_ROLE, lockCreator.address),
        true
      )
      // lock creator is also added to the LockManager role by default
      assert.equal(
        await lock.hasRole(LOCK_MANAGER_ROLE, lockCreator.address),
        true
      )
    })
  })
  describe('modifying permissions on an existing lock', () => {
    it('should allow a lockManager to add a KeyGranter', async () => {
      assert.equal(await lock.isLockManager(lockCreator.address), true)
      assert.equal(
        await lock.hasRole(KEY_GRANTER_ROLE, newKeyGranter.address),
        false
      )
      await lock.grantRole(KEY_GRANTER_ROLE, newKeyGranter.address)
      assert.equal(
        await lock.hasRole(KEY_GRANTER_ROLE, newKeyGranter.address),
        true
      )
    })

    it('should not allow anyone else to add a KeyGranter', async () => {
      assert.equal(await lock.isLockManager(notAuthorized.address), false)
      await reverts(
        lock
          .connect(notAuthorized)
          .grantRole(KEY_GRANTER_ROLE, newKeyGranter.address),
        `is missing role ${LOCK_MANAGER_ROLE}`
      )
    })

    it('should only allow a lockManager to remove a KeyGranter', async () => {
      await reverts(
        lock
          .connect(notAuthorized)
          .revokeRole(KEY_GRANTER_ROLE, newKeyGranter.address),
        `is missing role ${LOCK_MANAGER_ROLE}`
      )
      await lock.revokeRole(KEY_GRANTER_ROLE, newKeyGranter.address)
      assert.equal(
        await lock.hasRole(KEY_GRANTER_ROLE, newKeyGranter.address),
        false
      )
    })
  })
})
