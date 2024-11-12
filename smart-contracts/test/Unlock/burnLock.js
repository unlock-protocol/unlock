const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployContracts,
  deployLock,
  reverts,
  ADDRESS_ZERO,
} = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

describe('burnLock', () => {
  let attacker
  let lock, unlock
  let emptyImpl
  beforeEach(async () => {
    ;[, attacker] = await ethers.getSigners()
    ;({ unlock } = await deployContracts())
    lock = await deployLock({ unlock })
    const EmptyImpl = await ethers.getContractFactory('EmptyImpl')
    emptyImpl = await EmptyImpl.deploy()
  })
  describe('setting empty impl', () => {
    it('sets the impl correctly', async () => {
      assert.equal(await unlock.burnedLockImpl(), ADDRESS_ZERO)
      await unlock.setBurnedLockImpl(await emptyImpl.getAddress())
      assert.equal(await unlock.burnedLockImpl(), await emptyImpl.getAddress())
    })
    it('can only be set by a manager', async () => {
      await reverts(
        unlock
          .connect(attacker)
          .setBurnedLockImpl(await emptyImpl.getAddress()),
        'ONLY_OWNER'
      )
    })
  })

  describe('burning a lock', () => {
    it('upgrade to an empty implementation', async () => {
      await unlock.setBurnedLockImpl(await emptyImpl.getAddress())
      assert.equal(await unlock.burnedLockImpl(), await emptyImpl.getAddress())

      const tx = await unlock.burnLock(await lock.getAddress())
      const receipt = await tx.wait()
      assert.equal(await lock.name(), '')
      await reverts(lock.publicLockVersion())

      const event = await getEvent(receipt, 'LockBurned')
      assert.notEqual(event, null)
      assert.equal(event.args.lockAddress, await lock.getAddress())
    })
  })
  describe('only lock manager allowed', async () => {
    const [, attacker] = await ethers.getSigners()
    await reverts(
      unlock.connect(attacker).burnLock(await lock.getAddress()),
      'MANAGER_ONLY'
    )
  })
})
