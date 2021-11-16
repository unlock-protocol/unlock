const { ethers, upgrades } = require('hardhat')
const createLockHash = require('../helpers/createLockCalldata')

contract('isLockManager', () => {
  let unlock
  let publicLock
  let lock

  beforeEach(async () => {
    const [unlockOwner, creator] = await ethers.getSigners()

    const Unlock = await ethers.getContractFactory('Unlock')
    unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
      initializer: 'initialize(address)',
    })
    await unlock.deployed()

    const PublicLock = await ethers.getContractFactory('PublicLock')
    publicLock = await PublicLock.deploy()
    await publicLock.deployed()

    // add impl as v1
    const txImpl = await unlock.addLockTemplate(publicLock.address, 1)
    await txImpl.wait()

    // set v1 as main template
    await unlock.setLockTemplate(publicLock.address)

    // deploy a simple lock
    const args = [
      60 * 60 * 24 * 30, // 30 days
      ethers.constants.AddressZero,
      ethers.utils.parseEther('0.01'),
      10,
      'A neat upgradeable lock!',
    ]
    const calldata = await createLockHash({ args, from: creator.address })
    const tx = await unlock.createLock(calldata)

    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'NewLock')
    const { newLockAddress } = evt.args
    lock = await ethers.getContractAt('IPublicLock', newLockAddress)
  })

  it('should work with freshly created lock', async () => {
    const [, creator, unknown] = await ethers.getSigners()

    assert.equal(await lock.isLockManager(creator.address), true)
    assert.equal(await lock.isLockManager(unknown.address), false)

    assert.equal(
      await unlock.isLockManager(lock.address, creator.address),
      true
    )
    assert.equal(
      await unlock.isLockManager(lock.address, unknown.address),
      false
    )
  })

  it('work when mamager is added', async () => {
    const [, creator, manager] = await ethers.getSigners()
    assert.equal(await lock.isLockManager(creator.address), true)
    assert.equal(await lock.isLockManager(manager.address), false)
    await lock.connect(creator).addLockManager(manager.address)
    assert.equal(
      await unlock.isLockManager(lock.address, creator.address),
      true
    )
    assert.equal(
      await unlock.isLockManager(lock.address, manager.address),
      true
    )
  })

  it('work when manager is revoked', async () => {
    const [, creator, manager] = await ethers.getSigners()

    assert.equal(await lock.isLockManager(creator.address), true)
    assert.equal(await lock.isLockManager(manager.address), false)
    await lock.connect(creator).addLockManager(manager.address)
    assert.equal(
      await unlock.isLockManager(lock.address, creator.address),
      true
    )
    assert.equal(
      await unlock.isLockManager(lock.address, manager.address),
      true
    )
    await lock.connect(manager).renounceLockManager()
    assert.equal(
      await unlock.isLockManager(lock.address, manager.address),
      false
    )
  })
})
