const { deployLock, reverts, KEY_GRANTER_ROLE, LOCK_MANAGER_ROLE } = require('../../helpers')

let lock
let result
let lockCreator
let notAuthorized
let newKeyGranter

contract('Permissions / KeyGranter', (accounts) => {
  lockCreator = accounts[0]
  notAuthorized = accounts[9]
  newKeyGranter = accounts[1]

  before(async () => {
    lock = await deployLock()
  })

  describe('default permissions on a new lock', () => {
    it('should add the lock creator to the keyGranter role', async () => {
      assert.equal(await lock.hasRole(KEY_GRANTER_ROLE, lockCreator), true)
      // lock creator is also added to the LockManager role by default
      assert.equal(await lock.hasRole(LOCK_MANAGER_ROLE, lockCreator),true)
    })
  })
  describe('modifying permissions on an existing lock', () => {
    it('should allow a lockManager to add a KeyGranter', async () => {
      result = await lock.isLockManager(lockCreator)
      assert.equal(result, true)
      await lock.grantRole(KEY_GRANTER_ROLE, newKeyGranter, { from: lockCreator })
      result = await lock.hasRole(KEY_GRANTER_ROLE, newKeyGranter)
      assert.equal(result, true)
    })

    it('should not allow anyone else to add a KeyGranter', async () => {
      result = await lock.isLockManager(notAuthorized)
      assert.equal(result, false)
      await reverts(
        lock.grantRole(KEY_GRANTER_ROLE, accounts[5], { from: notAuthorized }),
        `is missing role ${LOCK_MANAGER_ROLE}`
      )
    })

    it('should only allow a lockManager to remove a KeyGranter', async () => {
      await reverts(
        lock.revokeRole(KEY_GRANTER_ROLE, newKeyGranter, { from: notAuthorized }),
        `is missing role ${LOCK_MANAGER_ROLE}`
      )
      await lock.revokeRole(KEY_GRANTER_ROLE, newKeyGranter, { from: lockCreator })
      result = await lock.hasRole(KEY_GRANTER_ROLE, newKeyGranter)
      assert.equal(result, false)
    })
  })
})
