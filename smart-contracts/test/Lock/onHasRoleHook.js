const assert = require('assert')
const {
  deployLock,
  deployERC20,
  ADDRESS_ZERO,
  LOCK_MANAGER_ROLE,
  KEY_GRANTER_ROLE,
} = require('../helpers')

const { ethers } = require('hardhat')
const {
  emitHookUpdatedEvent,
  canNotSetNonContractAddress,
} = require('./behaviors/hooks.js')

describe('Lock / onHasRoleHook', () => {
  let lock
  let hook
  let receipt
  let deployer, lockManager, keyGranter, tokenOwner
  let token

  before(async () => {
    ;[deployer, lockManager, keyGranter, tokenOwner] = await ethers.getSigners()
    lock = await deployLock()
    assert.equal(await lock.isLockManager(await deployer.getAddress()), true)

    // add a lock manager
    await lock.grantRole(LOCK_MANAGER_ROLE, await lockManager.getAddress())
    assert.equal(await lock.isLockManager(await lockManager.getAddress()), true)

    // setup hook
    const TestEventHooks = await ethers.getContractFactory('TestEventHooks')
    hook = await TestEventHooks.deploy()

    const tx = await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      await hook.getAddress()
    )
    receipt = await tx.wait()
  })

  it('emit the correct event', async () => {
    await emitHookUpdatedEvent({
      receipt,
      hookName: 'onHasRoleHook',
      hookAddress: await hook.getAddress(),
    })
  })

  it('cannot set the hook to a non-contract address', async () => {
    await canNotSetNonContractAddress({
      lock,
      index: 7,
    })
  })

  describe('original roles still accessible', () => {
    it('roles are preserved when no ERC20 is set', async () => {
      assert.equal(await lock.isLockManager(await deployer.getAddress()), true)
      assert.equal(
        await lock.hasRole(LOCK_MANAGER_ROLE, await deployer.getAddress()),
        true
      )
      assert.equal(
        await lock.hasRole(LOCK_MANAGER_ROLE, await lockManager.getAddress()),
        true
      )
    })
  })

  describe('returns a custom value based on ERC20 balance', () => {
    before(async () => {
      // setup ERC20 in hook
      token = await deployERC20(deployer)
      await hook.setupERC20Role(await token.getAddress())
    })

    it('hook is set correctly', async () => {
      assert.equal(await lock.onHasRoleHook(), await hook.getAddress())
    })

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
  })
})
