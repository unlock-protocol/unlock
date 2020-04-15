const { protocols } = require('hardlydifficult-ethereum-contracts')
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
  let tokenId

  before(async () => {
    contract = await LockRolesMock.new()
    lock = await protocols.unlock.createTestLock(web3, {
      from: lockCreator,
    })
    await lock.addLockManager(lockManager, { from: lockCreator })
    await lock.addKeyGranter(keyGranter, { from: lockCreator })
    await lock.grantKeys([keyOwner], [42], [keyManager], { from: lockCreator })
    tokenId = await lock.getTokenIdFor(keyOwner)
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

  it('keyManager is the keyManager', async () => {
    const isManager = await contract.isKeyManagerMock(
      lock.address,
      tokenId,
      keyManager
    )
    assert.equal(isManager, true)
  })

  it('keyOwner is not the keyManager', async () => {
    const isManager = await contract.isKeyManagerMock(
      lock.address,
      tokenId,
      keyOwner
    )
    assert.equal(isManager, false)
  })

  it('keyManager is keyManager', async () => {
    await contract.onlyKeyManagerMock(lock.address, tokenId, {
      from: keyManager,
    })
  })

  it('keyOwner is not keyManager', async () => {
    await reverts(
      contract.onlyKeyManagerMock(lock.address, tokenId, { from: keyOwner }),
      'ONLY_KEY_MANAGER'
    )
  })
})
