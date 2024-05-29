const { expect, assert } = require('chai')
const { ethers, upgrades } = require('hardhat')
const {
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')
const { ADDRESS_ZERO, reverts } = require('../helpers')
// lock args
const args = [
  60 * 60 * 24 * 30, // expirationDuration: 30 days
  ADDRESS_ZERO,
  ethers.parseEther('1'), // keyPrice: in wei
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
    unlock = await upgrades.deployProxy(
      Unlock,
      [await unlockOwner.getAddress()],
      {
        initializer: 'initialize(address)',
      }
    )

    // set version 1
    const PublicLock = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    publicLock = await PublicLock.deploy()

    await unlock.addLockTemplate(await publicLock.getAddress(), 1)
    await unlock.setLockTemplate(await publicLock.getAddress())
    expect(await unlock.publicLockLatestVersion()).to.equals(1n)

    // deploy new implementation
    const PublicLockUpgraded = await ethers.getContractFactory(
      'TestPublicLockUpgraded'
    )
    publicLockUpgraded = await PublicLockUpgraded.deploy()

    await unlock.addLockTemplate(await publicLockUpgraded.getAddress(), 2)
    expect(
      await unlock.publicLockVersions(await publicLockUpgraded.getAddress())
    ).to.equals(2n)

    // create lock calldata
    calldata = await createLockCalldata({
      args,
      from: await lockOwner.getAddress(),
    })
  })

  it('creates versioned locks successfully', async () => {
    const tx = await unlock.createUpgradeableLockAtVersion(calldata, 1)
    const lock1receipt = await tx.wait()

    const {
      args: { newLockAddress: lock1Address },
    } = await getEvent(lock1receipt, 'NewLock')

    const lock1 = await ethers.getContractAt(
      'contracts/PublicLock.sol:PublicLock',
      lock1Address
    )

    // lock creation params
    assert.equal(await lock1.expirationDuration(), args[0])
    assert.equal(await lock1.tokenAddress(), args[1])
    assert.equal(await lock1.keyPrice(), args[2])
    assert.equal(await lock1.maxNumberOfKeys(), args[3])
    assert.equal(await lock1.name(), args[4])

    // lock2
    const tx2 = await unlock.createUpgradeableLockAtVersion(calldata, 2)
    const lock2receipt = await tx2.wait()

    const {
      args: { newLockAddress: lock2Address },
    } = await getEvent(lock2receipt, 'NewLock')

    const lock2 = await ethers.getContractAt(
      'ITestPublicLockUpgraded',
      lock2Address
    )
    // lock creation params
    assert.equal(await lock2.expirationDuration(), args[0])
    assert.equal(await lock2.tokenAddress(), args[1])
    assert.equal(await lock2.keyPrice(), args[2])
    assert.equal(await lock2.maxNumberOfKeys(), args[3])
    assert.equal(await lock2.name(), args[4])

    // make sure upgrade was successful
    assert.equal(await lock2.sayHello(), 'hello world')
  })

  it('reverts if version is not set', async () => {
    await reverts(
      unlock.createUpgradeableLockAtVersion(calldata, 3),
      'MISSING_LOCK_TEMPLATE'
    )
  })
})
