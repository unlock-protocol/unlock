const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
const { ADDRESS_ZERO, reverts } = require('../helpers')
const {
  createLockCalldata,
  getEvent,
} = require('@unlock-protocol/hardhat-helpers')

describe('Unlock / removeLock', () => {
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

  it('Should able to remove lock only Owner', async () => {
    const [, creator] = await ethers.getSigners()

    await reverts(
      unlock.connect(creator).removeLock(await lock.getAddress()),
      'ONLY_OWNER'
    )
  })

  it('Owner should able to remove lock', async () => {
    const [unlockOwner] = await ethers.getSigners()

    const lockAddress = await lock.getAddress()
    await unlock.connect(unlockOwner).removeLock(lockAddress)

    const existingLock = await unlock.locks(lockAddress)
    assert.equal(existingLock.deployed, false)
    assert.equal(existingLock.totalSales, 0)
    assert.equal(existingLock.yieldedDiscountTokens, 0)
  })
})
