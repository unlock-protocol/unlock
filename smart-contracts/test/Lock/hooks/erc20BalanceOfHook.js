const { ethers } = require('hardhat')
const { assert } = require('chai')
const {
  reverts,
  ADDRESS_ZERO,
  purchaseKey,
  deployLock,
  deployERC20,
  compareBigNumbers,
} = require('../../helpers')

let lock
let hook
let token

let deployer, tokenOwner, keyOwner, attacker
const minAmount = ethers.utils.parseEther('0.05')

describe('ERC20BalanceOfHook', () => {
  beforeEach(async () => {
    ;[deployer, tokenOwner, keyOwner, attacker] = await ethers.getSigners()
    lock = await deployLock()

    // deploy some ERC20
    token = await deployERC20(deployer.address)

    // deploy the hook
    const Erc20TokenUriHook = await ethers.getContractFactory(
      'ERC20BalanceOfHook'
    )
    hook = await Erc20TokenUriHook.deploy()

    // set the hook
    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      hook.address,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
  })

  describe('setting mapping', () => {
    beforeEach(async () => {
      await hook.createMapping(lock.address, token.address, minAmount)
    })
    it('should record the corresponding erc20 address', async () => {
      assert.equal(await hook.tokenAddresses(lock.address), token.address)
    })
    it('should record the corresponding min amount', async () => {
      compareBigNumbers(await hook.minAmounts(lock.address), minAmount)
    })
    it('should only allow lock managers to set mapping', async () => {
      await reverts(
        hook
          .connect(attacker)
          .createMapping(lock.address, token.address, minAmount),
        'Caller does not have the LockManager role'
      )
    })
    it('throws on zero addresses', async () => {
      await reverts(
        hook.createMapping(ADDRESS_ZERO, token.address, minAmount),
        'Lock address can not be zero'
      )
      await reverts(
        hook.createMapping(lock.address, ADDRESS_ZERO, minAmount),
        'ERC20 address can not be zero'
      )
      await reverts(
        hook.createMapping(lock.address, token.address, 0),
        'minAmount can not be zero'
      )
    })
  })

  describe('mapping is not set', () => {
    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(keyOwner.address), false)
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, keyOwner.address)
      assert.equal(await lock.getHasValidKey(keyOwner.address), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, keyOwner.address)
      assert.equal(await lock.getHasValidKey(keyOwner.address), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(keyOwner.address), false)
    })
  })

  describe('mapping is set, account holds less than necessary', () => {
    beforeEach(async () => {
      // mint one token
      await token.mint(tokenOwner.address, ethers.utils.parseEther('0.01'))
      // create mapping
      await hook.createMapping(lock.address, token.address, minAmount)
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(tokenOwner.address), false)
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, tokenOwner.address)
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, tokenOwner.address)
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(tokenOwner.address), false)
    })
  })

  describe('mapping is set, account holds more than necessary', () => {
    beforeEach(async () => {
      // mint one token
      await token.mint(tokenOwner.address, ethers.utils.parseEther('0.5'))
      // create mapping
      await hook.createMapping(lock.address, token.address, minAmount)
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, tokenOwner.address)
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, tokenOwner.address)
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)
    })
  })

  describe('mapping is set, account holds just as much as necessary', () => {
    beforeEach(async () => {
      // mint one token
      await token.mint(tokenOwner.address, minAmount)
      // create mapping
      await hook.createMapping(lock.address, token.address, minAmount)
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, tokenOwner.address)
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, tokenOwner.address)
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(tokenOwner.address), true)
    })
  })
})
