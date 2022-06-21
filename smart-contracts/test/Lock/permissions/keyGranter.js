const { deployLock, reverts } = require('../../helpers/errors')

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
      let result = await lock.isKeyGranter(lockCreator)
      assert.equal(result, true)
    })
  })
  describe('modifying permissions on an existing lock', () => {
    // lock creator is also added to the LockManager role by default
    it('should allow a lockManager to add a KeyGranter', async () => {
      result = await lock.isLockManager(lockCreator)
      assert.equal(result, true)
      await lock.addKeyGranter(newKeyGranter, { from: lockCreator })
      result = await lock.isKeyGranter(newKeyGranter)
      assert.equal(result, true)
    })

    it('should not allow anyone else to add a KeyGranter', async () => {
      result = await lock.isLockManager(notAuthorized)
      assert.equal(result, false)
      await reverts(
        lock.addKeyGranter(accounts[5], { from: notAuthorized }),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('should only allow a lockManager to remove a KeyGranter', async () => {
      await reverts(
        lock.revokeKeyGranter(newKeyGranter, { from: notAuthorized }),
        'ONLY_LOCK_MANAGER'
      )
      await lock.revokeKeyGranter(newKeyGranter, { from: lockCreator })
      result = await lock.isKeyGranter(newKeyGranter)
      assert.equal(result, false)
    })
  })
})
