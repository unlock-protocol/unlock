const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  reverts,
  ADDRESS_ZERO,
  deployLock,
  deployContracts,
  parseInterface,
} = require('../helpers')

describe('Lock / initializers', () => {
  let unlockOwner, caller
  before(async () => {
    ;[unlockOwner, , , , , , , caller] = await ethers.getSigners()
  })

  describe('initialize()', () => {
    it('There are exactly 1 public initializer in PublicLock', async () => {
      const { interface } = await ethers.getContractFactory('PublicLock')
      const abi = parseInterface(interface)
      const count = abi.filter((func) => func.includes('initialize'))
      assert.equal(count.length, 1)
    })

    it('may not be called again after deploying a lock', async () => {
      const lock = await deployLock()
      await reverts(
        lock.initialize(unlockOwner.address, 0, ADDRESS_ZERO, 0, 0, ''),
        'Initializable: contract is already initialized'
      )
    })
  })

  describe('initializing when deploying', () => {
    it('admin role has to be revoked manually', async () => {
      const callerAddress = caller.address
      const PublicLock = await ethers.getContractFactory('PublicLock')
      const template = await PublicLock.deploy()
      await template.initialize(callerAddress, 0, ADDRESS_ZERO, 0, 0, '')
      await assert.equal(await template.isLockManager(callerAddress), true)
      await template.connect(caller).renounceLockManager()
      await assert.equal(await template.isLockManager(callerAddress), false)
    })
  })

  describe('initializing when setting as Unlock template', () => {
    it('admin role is revoked when adding a template', async () => {
      // deploy contracts
      const PublicLock = await ethers.getContractFactory('PublicLock')
      const template = await PublicLock.deploy()
      const { unlock } = await deployContracts()

      // add as template
      await unlock.addLockTemplate(
        template.address,
        await template.publicLockVersion()
      )

      await assert.equal(await template.isLockManager(unlock.address), false)
      await reverts(
        template.initialize(unlockOwner.address, 0, ADDRESS_ZERO, 0, 0, ''),
        'Initializable: contract is already initialized'
      )
    })

    it('template can be re-added even if already initialized', async () => {
      // initialize a template manually
      const PublicLock = await ethers.getContractFactory('PublicLock')
      const template = await PublicLock.deploy()
      await template.initialize(caller.address, 0, ADDRESS_ZERO, 0, 0, '')
      await template.connect(caller).renounceLockManager()
      await assert.equal(await template.isLockManager(caller.address), false)

      // add and set template in Unlock
      const { unlock } = await deployContracts()
      await unlock.addLockTemplate(
        template.address,
        await template.publicLockVersion()
      )
      await unlock.setLockTemplate(template.address)

      await assert.equal(await template.isLockManager(unlock.address), false)
      await assert.equal(await unlock.publicLockAddress(), template.address)

      // cant be re-initialized
      await reverts(
        template.initialize(unlockOwner.address, 0, ADDRESS_ZERO, 0, 0, ''),
        'Initializable: contract is already initialized'
      )
    })
  })
})
