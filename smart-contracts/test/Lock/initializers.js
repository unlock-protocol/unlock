const assert = require('assert')
const { ethers } = require('hardhat')

const {
  reverts,
  ADDRESS_ZERO,
  deployLock,
  deployContracts,
  parseInterface,
  LOCK_MANAGER_ROLE,
} = require('../helpers')

describe('Lock / initializers', () => {
  let deployer, lockOwner, caller
  before(async () => {
    ;[deployer, lockOwner, , , , , , caller] = await ethers.getSigners()
  })

  describe('initialize()', () => {
    it('There are exactly 1 public initializer in PublicLock', async () => {
      const { interface } = await ethers.getContractFactory(
        'contracts/PublicLock.sol:PublicLock'
      )
      const abi = parseInterface(interface)
      const count = abi.filter((func) => func.includes('initialize'))
      assert.equal(count.length, 1)
    })

    it('may not be called again after deploying a lock', async () => {
      const lock = await deployLock()
      await reverts(
        lock.initialize(await deployer.getAddress(), 0, ADDRESS_ZERO, 0, 0, ''),
        'Initializable: contract is already initialized'
      )
    })
  })

  describe('initializing when deploying', () => {
    it('admin role has to be revoked manually', async () => {
      const callerAddress = await caller.getAddress()
      const PublicLock = await ethers.getContractFactory(
        'contracts/PublicLock.sol:PublicLock'
      )
      const template = await PublicLock.deploy()
      await template.initialize(callerAddress, 0, ADDRESS_ZERO, 0, 0, '')
      await assert.equal(await template.isLockManager(callerAddress), true)
      await template
        .connect(caller)
        .renounceRole(LOCK_MANAGER_ROLE, await caller.getAddress())
      await assert.equal(await template.isLockManager(callerAddress), false)
    })
  })

  describe('initializing when setting as Unlock template', () => {
    it('admin role is revoked when adding a template that hasnt been initialized', async () => {
      // deploy contracts
      const PublicLock = await ethers.getContractFactory(
        'contracts/PublicLock.sol:PublicLock'
      )
      const template = await PublicLock.deploy()
      const { unlock } = await deployContracts()

      // add as template
      await unlock.addLockTemplate(
        await template.getAddress(),
        await template.publicLockVersion()
      )

      // unlock should not be lock manager anymore
      await assert.equal(
        await template.isLockManager(await unlock.getAddress()),
        false
      )

      // deployer should not be lock manager
      await assert.equal(
        await template.isLockManager(await deployer.getAddress()),
        false
      )

      await reverts(
        template.initialize(
          await lockOwner.getAddress(),
          0,
          ADDRESS_ZERO,
          0,
          0,
          ''
        ),
        'Initializable: contract is already initialized'
      )
    })

    it('template can be re-added even if already initialized', async () => {
      // initialize a template manually
      const PublicLock = await ethers.getContractFactory(
        'contracts/PublicLock.sol:PublicLock'
      )
      const template = await PublicLock.deploy()
      await template.initialize(
        await caller.getAddress(),
        0,
        ADDRESS_ZERO,
        0,
        0,
        ''
      )
      await template
        .connect(caller)
        .renounceRole(LOCK_MANAGER_ROLE, await caller.getAddress())
      await assert.equal(
        await template.isLockManager(await caller.getAddress()),
        false
      )

      // add and set template in Unlock
      const { unlock } = await deployContracts()
      await unlock.addLockTemplate(
        await template.getAddress(),
        await template.publicLockVersion()
      )
      await unlock.setLockTemplate(await template.getAddress())

      await assert.equal(
        await template.isLockManager(await unlock.getAddress()),
        false
      )
      await assert.equal(
        await unlock.publicLockAddress(),
        await template.getAddress()
      )

      // cant be re-initialized
      await reverts(
        template.initialize(
          await deployer.getAddress(),
          0,
          ADDRESS_ZERO,
          0,
          0,
          ''
        ),
        'Initializable: contract is already initialized'
      )
    })
  })
})
