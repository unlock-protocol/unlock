const { expect, assert } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { expectRevert } = require('@openzeppelin/test-helpers')
const createLockHash = require('../helpers/createLockCalldata')
const { ADDRESS_ZERO } = require('../helpers/constants')
// lock args
const args = [
  60 * 60 * 24 * 30, // expirationDuration: 30 days
  ADDRESS_ZERO,
  ethers.utils.parseEther('1'), // keyPrice: in wei
  100, // maxNumberOfKeys
  'New Lock',
]

describe('Unlock / createUpgradeableLockAtVersion', () => {
  let unlock
  let publicLock
  let publicLockUpgraded
  let calldata
  let unlockOwner
  let lockOwner

  beforeEach(async () => {
    ;[unlockOwner, lockOwner] = await ethers.getSigners()
    const Unlock = await ethers.getContractFactory('Unlock')
    unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
      initializer: 'initialize(address)',
    })
    await unlock.deployed()

    // set version 1
    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    publicLock = await PublicLock.deploy()
    await publicLock.deployed()
    const tx1 = await unlock.addLockTemplate(publicLock.address, 1)
    await tx1.wait()
    expect(await unlock.publicLockLatestVersion()).to.equals(1)

    // deploy new implementation
    const PublicLockUpgraded = await ethers.getContractFactory(
      'TestPublicLockUpgraded'
    )
    publicLockUpgraded = await PublicLockUpgraded.deploy()
    await publicLockUpgraded.deployed()
    const tx2 = await unlock.addLockTemplate(publicLockUpgraded.address, 2)
    await tx2.wait()
    expect(await unlock.publicLockLatestVersion()).to.equals(2)

    // create lock calldata
    calldata = await createLockHash({ args, from: lockOwner.address })
  })

  it('creates versioned locks successfully', async () => {
    const tx = await unlock.createUpgradeableLockAtVersion(calldata, 1)
    const { events: lock1Events } = await tx.wait()

    const {
      args: { newLockAddress: lock1Address },
    } = lock1Events.find(({ event }) => event === 'NewLock')

    const lock1 = await ethers.getContractAt(
      'contracts/PublicLock.sol:PublicLock',
      lock1Address
    )

    // lock creation params
    assert.equal(await lock1.expirationDuration(), args[0])
    assert.equal(await lock1.tokenAddress(), args[1])
    assert.equal((await lock1.keyPrice()).toString(), args[2].toString())
    assert.equal(await lock1.maxNumberOfKeys(), args[3])
    assert.equal(await lock1.name(), args[4])

    // lock2
    const tx2 = await unlock.createUpgradeableLockAtVersion(calldata, 2)
    const { events: lock2Events } = await tx2.wait()

    const {
      args: { newLockAddress: lock2Address },
    } = lock2Events.find(({ event }) => event === 'NewLock')

    const lock2 = await ethers.getContractAt(
      'ITestPublicLockUpgraded',
      lock2Address
    )
    // lock creation params
    assert.equal(await lock2.expirationDuration(), args[0])
    assert.equal(await lock2.tokenAddress(), args[1])
    assert.equal((await lock2.keyPrice()).toString(), args[2].toString())
    assert.equal(await lock2.maxNumberOfKeys(), args[3])
    assert.equal(await lock2.name(), args[4])

    // make sure upgrade was successful
    assert.equal(await lock2.sayHello(), 'hello world')
  })

  it('reverts if version is not set', async () => {
    await expectRevert(
      unlock.createUpgradeableLockAtVersion(calldata, 3),
      'MISSING_LOCK_TEMPLATE'
    )
  })
})
