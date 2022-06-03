const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../helpers/errors')
const createLockHash = require('../helpers/createLockCalldata')
const { ADDRESS_ZERO } = require('../helpers/constants')
describe('upgradeLock (deploy template with Proxy)', () => {
  let unlock
  let lock
  let publicLock
  let publicLockUpgraded
  let currentVersion

  beforeEach(async () => {
    const [unlockOwner, creator] = await ethers.getSigners()

    const Unlock = await ethers.getContractFactory('Unlock')
    unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
      initializer: 'initialize(address)',
    })
    await unlock.deployed()

    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    publicLock = await PublicLock.deploy()
    await publicLock.deployed()

    currentVersion = await publicLock.publicLockVersion()

    // add impl as v1
    const txImpl = await unlock.addLockTemplate(
      publicLock.address,
      currentVersion
    )
    await txImpl.wait()

    // set v1 as main template
    await unlock.setLockTemplate(publicLock.address)

    // deploy a simple lock
    const args = [
      60 * 60 * 24 * 30, // 30 days
      ADDRESS_ZERO,
      ethers.utils.parseEther('0.01'),
      10,
      'A neat upgradeable lock!',
    ]
    const calldata = await createLockHash({ args, from: creator.address })
    const tx = await unlock.createUpgradeableLock(calldata)
    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'NewLock')
    const { newLockAddress } = evt.args
    lock = await ethers.getContractAt('IPublicLock', newLockAddress)

    // deploy new implementation
    const PublicLockUpgraded = await ethers.getContractFactory(
      'TestPublicLockUpgraded'
    )
    publicLockUpgraded = await PublicLockUpgraded.deploy()
    await publicLockUpgraded.deployed()
  })

  it('Should forbid bump more than 1 version', async () => {
    const [, creator] = await ethers.getSigners()

    await unlock.addLockTemplate(publicLockUpgraded.address, currentVersion + 2)
    await reverts(
      unlock.connect(creator).upgradeLock(lock.address, currentVersion + 2),
      'VERSION_TOO_HIGH'
    )
    await reverts(
      unlock.connect(creator).upgradeLock(lock.address, 1), // smaller one
      'VERSION_TOO_HIGH'
    )
    await reverts(
      unlock.connect(creator).upgradeLock(lock.address, 135),
      'VERSION_TOO_HIGH'
    )
  })

  it('Should forbid upgrade if version is not set', async () => {
    const [, creator] = await ethers.getSigners()
    await reverts(
      unlock.connect(creator).upgradeLock(lock.address, currentVersion + 1),
      'MISSING_TEMPLATE'
    )
  })

  it('Should upgrade a lock with a new template', async () => {
    const [, creator] = await ethers.getSigners()
    assert.equal(await unlock.publicLockLatestVersion(), currentVersion)

    await unlock.addLockTemplate(publicLockUpgraded.address, currentVersion + 1)
    await unlock.connect(creator).upgradeLock(lock.address, currentVersion + 1)

    assert.equal(await unlock.publicLockLatestVersion(), currentVersion + 1)

    // make sure upgrade was successful
    lock = await ethers.getContractAt('ITestPublicLockUpgraded', lock.address)
    assert.equal(await lock.sayHello(), 'hello world')
  })

  it('Should forbid non-managers to upgrade', async () => {
    const [, , unknown] = await ethers.getSigners()
    await unlock.addLockTemplate(publicLockUpgraded.address, currentVersion + 1)
    await reverts(
      unlock.connect(unknown).upgradeLock(lock.address, currentVersion + 1),
      'MANAGER_ONLY'
    )
  })

  it('Should emit an upgrade event', async () => {
    const [, creator] = await ethers.getSigners()
    await unlock.addLockTemplate(publicLockUpgraded.address, currentVersion + 1)

    const tx = await unlock
      .connect(creator)
      .upgradeLock(lock.address, currentVersion + 1)
    const { events } = await tx.wait()

    // check if box instance works
    const evt = events.find((v) => v.event === 'LockUpgraded')
    const { lockAddress, version } = evt.args

    assert.equal(lockAddress, lock.address)
    assert.equal(version, currentVersion + 1)

    // make sure upgrade was successful
    lock = await ethers.getContractAt('ITestPublicLockUpgraded', lockAddress)
    assert.equal(await lock.sayHello(), 'hello world')
  })
})
