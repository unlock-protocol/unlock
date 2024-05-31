const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
const contracts = require('@unlock-protocol/contracts')
const { ADDRESS_ZERO, reverts } = require('../helpers')
const {
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')

describe('upgradeLock (deploy template with Proxy)', () => {
  let unlock
  let lock
  let publicLock
  let publicLockUpgraded
  let currentVersion

  beforeEach(async () => {
    const [unlockOwner, creator] = await ethers.getSigners()

    const Unlock = await ethers.getContractFactory('Unlock')
    unlock = await upgrades.deployProxy(
      Unlock,
      [await unlockOwner.getAddress()],
      {
        initializer: 'initialize(address)',
      }
    )

    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    publicLock = await PublicLock.deploy()

    currentVersion = await publicLock.publicLockVersion()

    // add impl as v1
    const txImpl = await unlock.addLockTemplate(
      await publicLock.getAddress(),
      currentVersion
    )
    await txImpl.wait()

    // set v1 as main template
    await unlock.setLockTemplate(await publicLock.getAddress())

    // deploy a simple lock
    const args = [
      60 * 60 * 24 * 30, // 30 days
      ADDRESS_ZERO,
      ethers.parseEther('0.01'),
      10,
      'A neat upgradeable lock!',
    ]
    const calldata = await createLockCalldata({
      args,
      from: await creator.getAddress(),
    })
    const tx = await unlock.createUpgradeableLock(calldata)
    const receipt = await tx.wait()
    const evt = await getEvent(receipt, 'NewLock')
    const { newLockAddress } = evt.args
    lock = await ethers.getContractAt(
      'contracts/interfaces/IPublicLock.sol:IPublicLock',
      newLockAddress
    )

    // deploy new implementation
    const PublicLockUpgraded = await ethers.getContractFactory(
      'TestPublicLockUpgraded'
    )
    publicLockUpgraded = await PublicLockUpgraded.deploy()
  })

  it('Should forbid bump more than 1 version', async () => {
    const [, creator] = await ethers.getSigners()

    await unlock.addLockTemplate(
      await publicLockUpgraded.getAddress(),
      currentVersion + 2n
    )
    await reverts(
      unlock
        .connect(creator)
        .upgradeLock(await lock.getAddress(), currentVersion + 2n),
      'VERSION_TOO_HIGH'
    )
    await reverts(
      unlock.connect(creator).upgradeLock(await lock.getAddress(), 1), // smaller one
      'VERSION_TOO_HIGH'
    )
    await reverts(
      unlock.connect(creator).upgradeLock(await lock.getAddress(), 135),
      'VERSION_TOO_HIGH'
    )
  })

  it('Should forbid upgrade if version is not set', async () => {
    const [, creator] = await ethers.getSigners()
    await reverts(
      unlock
        .connect(creator)
        .upgradeLock(await lock.getAddress(), currentVersion + 1n),
      'MISSING_TEMPLATE'
    )
  })

  it('Should upgrade a lock with a new template', async () => {
    const [, creator] = await ethers.getSigners()
    assert.equal(await unlock.publicLockLatestVersion(), currentVersion)

    await unlock.addLockTemplate(
      await publicLockUpgraded.getAddress(),
      currentVersion + 1n
    )
    await unlock
      .connect(creator)
      .upgradeLock(await lock.getAddress(), currentVersion + 1n)

    // make sure upgrade was successful
    lock = await ethers.getContractAt(
      'ITestPublicLockUpgraded',
      await lock.getAddress()
    )
    assert.equal(await lock.sayHello(), 'hello world')
  })

  it('Should forbid non-managers to upgrade', async () => {
    const [, , unknown] = await ethers.getSigners()
    await unlock.addLockTemplate(
      await publicLockUpgraded.getAddress(),
      currentVersion + 1n
    )
    await reverts(
      unlock
        .connect(unknown)
        .upgradeLock(await lock.getAddress(), currentVersion + 1n),
      'MANAGER_ONLY'
    )
  })

  it('Should emit an upgrade event', async () => {
    const [, creator] = await ethers.getSigners()
    await unlock.addLockTemplate(
      await publicLockUpgraded.getAddress(),
      currentVersion + 1n
    )

    const tx = await unlock
      .connect(creator)
      .upgradeLock(await lock.getAddress(), currentVersion + 1n)
    const receipt = await tx.wait()

    // check if box instance works
    const evt = await getEvent(receipt, 'LockUpgraded')
    const { lockAddress, version } = evt.args

    assert.equal(lockAddress, await lock.getAddress())
    assert.equal(version, currentVersion + 1n)

    // make sure upgrade was successful
    lock = await ethers.getContractAt('ITestPublicLockUpgraded', lockAddress)
    assert.equal(await lock.sayHello(), 'hello world')
  })
})

describe('upgrades', async () => {
  let unlock
  let lock
  let latestVersion
  let firstUpgradableVersion = 9

  const versions = {}
  const duration = 60 * 60 * 24 * 30 // 30 days
  const currency = ADDRESS_ZERO
  const price = ethers.parseEther('0.01')
  const maxKeys = 10
  const name = 'A neat upgradeable lock!'

  before(async () => {
    const [unlockOwner, creator] = await ethers.getSigners()

    const Unlock = await ethers.getContractFactory('Unlock')
    unlock = await upgrades.deployProxy(
      Unlock,
      [await unlockOwner.getAddress()],
      {
        initializer: 'initialize(address)',
      }
    )

    // Helper function
    const getPublicLockFactoryAtVersion = async (publicLockVersion) => {
      const { abi, bytecode } = contracts[`PublicLockV${publicLockVersion}`]
      const PublicLock = await ethers.getContractFactory(abi, bytecode)
      return PublicLock
    }

    const deployAndAddPublicLockVersion = async (publicLockVersion) => {
      const PublicLock = !publicLockVersion
        ? await ethers.getContractFactory('contracts/PublicLock.sol:PublicLock')
        : await getPublicLockFactoryAtVersion(publicLockVersion)

      const publicLock = await PublicLock.deploy()

      const txImpl = await unlock.addLockTemplate(
        await publicLock.getAddress(),
        await publicLock.publicLockVersion()
      )
      await txImpl.wait()
      return publicLock
    }

    // Add oldest
    const oldestPublicLock = await deployAndAddPublicLockVersion(
      firstUpgradableVersion
    )
    versions[firstUpgradableVersion] = oldestPublicLock

    // deploy a simple lock
    const calldata = await createLockCalldata({
      args: [duration, currency, price, maxKeys, name],
      from: await creator.getAddress(),
    })

    const tx = await unlock.createUpgradeableLockAtVersion(
      calldata,
      firstUpgradableVersion
    )
    const receipt = await tx.wait()
    const evt = await getEvent(receipt, 'NewLock')
    const { newLockAddress } = evt.args
    lock = oldestPublicLock.attach(newLockAddress)

    // Add latest
    const latestPublicLock = await deployAndAddPublicLockVersion()
    latestVersion = await latestPublicLock.publicLockVersion()
    versions[latestVersion] = latestPublicLock

    // add all versions in between!
    for (
      let currentVersion = firstUpgradableVersion + 1;
      currentVersion < latestVersion;
      currentVersion++
    ) {
      const publicLock = await deployAndAddPublicLockVersion(currentVersion)
      versions[currentVersion] = publicLock
    }
  })

  it('all versions should match', async () => {
    for (let version of Object.keys(versions)) {
      assert.equal(await versions[version].publicLockVersion(), version)
      assert.equal(
        await unlock.publicLockImpls(version),
        await versions[version].getAddress()
      )
      assert.equal(
        await unlock.publicLockVersions(await versions[version].getAddress()),
        version
      )
    }
  })

  it('lock should be initialized as expected', async () => {
    assert.equal(await lock.publicLockVersion(), firstUpgradableVersion)
    assert.equal(await lock.name(), name)
    assert.equal(await lock.expirationDuration(), duration)
    assert.equal(await lock.keyPrice(), price)
    assert.equal(await lock.maxNumberOfKeys(), maxKeys)
    assert.equal(await lock.tokenAddress(), currency)
  })

  it(`should not change on upgrades from v${firstUpgradableVersion} to v${latestVersion}`, async () => {
    for (
      let currentVersion = firstUpgradableVersion + 1;
      currentVersion <= latestVersion;
      currentVersion++
    ) {
      const [, creator] = await ethers.getSigners()
      console.log(
        `going to upgrade from ${await lock.publicLockVersion()} to ${currentVersion}`
      )
      await unlock
        .connect(creator)
        .upgradeLock(await lock.getAddress(), currentVersion)
      assert.equal(await lock.publicLockVersion(), currentVersion)
      assert.equal(await lock.name(), name)
      assert.equal(await lock.expirationDuration(), duration)
      assert.equal(await lock.keyPrice(), price)
      assert.equal(await lock.maxNumberOfKeys(), maxKeys)
      assert.equal(await lock.tokenAddress(), currency)
    }
  })
})
