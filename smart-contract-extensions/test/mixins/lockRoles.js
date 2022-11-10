const { protocols } = require('hardlydifficult-eth')
const { reverts } = require('truffle-assertions')

const LockRolesMock = artifacts.require('LockRolesMock.sol')

contract('LockRoles', accounts => {
  const [
    lockCreator,
    lockManager,
    keyGranter,
    keyOwner,
    keyManager,
    other,
  ] = accounts
  let contract
  let lock

  before(async () => {
    contract = await LockRolesMock.new()
    lock = await protocols.unlock.createTestLock(web3, {
      from: lockCreator,
    })
    await lock.addLockManager(lockManager, { from: lockCreator })
    await lock.addKeyGranter(keyGranter, { from: lockCreator })
    await lock.grantKeys([keyOwner], [42], [keyManager], { from: lockCreator })
  })

  it('lockCreator is a manager', async () => {
    await contract.onlyLockManagerMock(lock.address, { from: lockCreator })
  })

  it('lockManager is a manager', async () => {
    await contract.onlyLockManagerMock(lock.address, { from: lockManager })
  })

  it('other is not a manager', async () => {
    await reverts(
      contract.onlyLockManagerMock(lock.address, { from: other }),
      'ONLY_LOCK_MANAGER'
    )
  })

  it('lockCreator can grant keys', async () => {
    await contract.onlyKeyGranterOrManagerMock(lock.address, {
      from: lockCreator,
    })
  })

  it('lockManager can grant keys', async () => {
    await contract.onlyKeyGranterOrManagerMock(lock.address, {
      from: lockManager,
    })
  })

  it('keyGranter can grant keys', async () => {
    await contract.onlyKeyGranterOrManagerMock(lock.address, {
      from: keyGranter,
    })
  })

  it('other cannot grant keys', async () => {
    await reverts(
      contract.onlyKeyGranterOrManagerMock(lock.address, { from: other }),
      'ONLY_'
    )
  })
})
