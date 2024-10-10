const assert = require('assert')
const {
  deployLock,
  deployERC20,
  ADDRESS_ZERO,
  KEY_GRANTER_ROLE,
} = require('../helpers')

const { ethers } = require('hardhat')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

describe('Lock / onHasRoleHook', () => {
  let lock
  let testEventHooks
  let receipt
  let deployer, lockManager, keyGranter, tokenOwner
  let token

  before(async () => {
    ;[deployer, lockManager, keyGranter, tokenOwner] = await ethers.getSigners()
    lock = await deployLock({ isEthers: true })
    assert.equal(await lock.isLockManager(await deployer.getAddress()), true)

    // add a lock manager
    await lock.addLockManager(await lockManager.getAddress())
    assert.equal(await lock.isLockManager(await lockManager.getAddress()), true)

    // setup hook
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    testEventHooks = await TestEventHooks.deploy()
    const tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      await testEventHooks.getAddress()
    )
    receipt = await tx.wait()

    // make sure default returns false
    assert.equal(
      await lock.isLockManager(await lockManager.getAddress()),
      false
    )

    // setup ERC20 in hook
    token = await deployERC20(deployer)
    await testEventHooks.setupERC20Role(await token.getAddress())
  })

  describe('returns a custom value based on ERC20 balance', () => {
    it('default to false if no ERC20 token', async () => {
      // make sure default returns false
      assert.equal(
        await lock.isLockManager(await tokenOwner.getAddress()),
        false
      )
      assert.equal(
        await lock.hasRole(KEY_GRANTER_ROLE, await tokenOwner.getAddress()),
        false
      )
    })

    it('is lock manager if balance > 10', async () => {
      await token.mint(await tokenOwner.getAddress(), 10n * 10n ** 18n + 1n)
      assert.equal(
        await lock.isLockManager(await tokenOwner.getAddress()),
        true
      )
      assert.equal(
        await lock.hasRole(KEY_GRANTER_ROLE, await tokenOwner.getAddress()),
        false
      )
    })

    it('is key granter if balance > 20', async () => {
      await token.mint(await tokenOwner.getAddress(), 10n * 10n ** 18n)
      assert.equal(
        await lock.isLockManager(await tokenOwner.getAddress()),
        true
      )
      assert.equal(
        await lock.hasRole(KEY_GRANTER_ROLE, await tokenOwner.getAddress()),
        true
      )
    })

    it('emit the correct event', async () => {
      await emitHookUpdatedEvent({
        receipt,
        hookName: 'onHasRoleHook',
        hookAddress: await testEventHooks.getAddress(),
      })
    })

    it('cannot set the hook to a non-contract address', async () => {
      await canNotSetNonContractAddress({ lock, index: 7 })
    })
  })
})
