const assert = require('assert')
const { ethers } = require('hardhat')
const { deployContracts, deployLock, reverts } = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

describe('burnLock', () => {
  let lock, unlock
  beforeEach(async () => {
    ;({ unlock } = await deployContracts())
    lock = await deployLock({ unlock })
  })
  describe('burning a lock', () => {
    it('upgrade to an empty implementation', async () => {
      const tx = await unlock.burnLock(await lock.getAddress())
      const receipt = await tx.wait()
      const event = await getEvent(receipt, 'LockBurned')
      assert.notEqual(event, null)
      await reverts(lock.publicLockVersion())
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
