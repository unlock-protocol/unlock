const { ethers } = require('hardhat')
const assert = require('assert')
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
const minAmount = ethers.parseEther('0.05')

describe('ERC20BalanceOfHook', () => {
  beforeEach(async () => {
    ;[deployer, tokenOwner, keyOwner, attacker] = await ethers.getSigners()
    lock = await deployLock()

    // deploy some ERC20
    token = await deployERC20(await deployer.getAddress())

    // deploy the hook
    const Erc20TokenUriHook =
      await ethers.getContractFactory('ERC20BalanceOfHook')
    hook = await Erc20TokenUriHook.deploy()

    // set the hook
    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      await hook.getAddress(),
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      ADDRESS_ZERO
    )
  })

  describe('setting mapping', () => {
    beforeEach(async () => {
      await hook.createMapping(
        await lock.getAddress(),
        await token.getAddress(),
        minAmount
      )
    })
    it('should record the corresponding erc20 address', async () => {
      assert.equal(
        await hook.tokenAddresses(await lock.getAddress()),
        await token.getAddress()
      )
    })
    it('should record the corresponding min amount', async () => {
      compareBigNumbers(
        await hook.minAmounts(await lock.getAddress()),
        minAmount
      )
    })
    it('should only allow lock managers to set mapping', async () => {
      await reverts(
        hook
          .connect(attacker)
          .createMapping(
            await lock.getAddress(),
            await token.getAddress(),
            minAmount
          ),
        'Caller does not have the LockManager role'
      )
    })
    it('throws on zero addresses', async () => {
      await reverts(
        hook.createMapping(ADDRESS_ZERO, await token.getAddress(), minAmount),
        'Lock address can not be zero'
      )
      await reverts(
        hook.createMapping(await lock.getAddress(), ADDRESS_ZERO, minAmount),
        'ERC20 address can not be zero'
      )
      await reverts(
        hook.createMapping(
          await lock.getAddress(),
          await token.getAddress(),
          0
        ),
        'minAmount can not be zero'
      )
    })
  })

  describe('mapping is not set', () => {
    it('with no valid key', async () => {
      assert.equal(
        await lock.getHasValidKey(await keyOwner.getAddress()),
        false
      )
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, await keyOwner.getAddress())
      assert.equal(await lock.getHasValidKey(await keyOwner.getAddress()), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, await keyOwner.getAddress())
      assert.equal(await lock.getHasValidKey(await keyOwner.getAddress()), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(
        await lock.getHasValidKey(await keyOwner.getAddress()),
        false
      )
    })
  })

  describe('mapping is set, account holds less than necessary', () => {
    beforeEach(async () => {
      // mint one token
      await token.mint(await tokenOwner.getAddress(), ethers.parseEther('0.01'))
      // create mapping
      await hook.createMapping(
        await lock.getAddress(),
        await token.getAddress(),
        minAmount
      )
    })

    it('with no valid key', async () => {
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        false
      )
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, await tokenOwner.getAddress())
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, await tokenOwner.getAddress())
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        false
      )
    })
  })

  describe('mapping is set, account holds more than necessary', () => {
    beforeEach(async () => {
      // mint one token
      await token.mint(await tokenOwner.getAddress(), ethers.parseEther('0.5'))
      // create mapping
      await hook.createMapping(
        await lock.getAddress(),
        await token.getAddress(),
        minAmount
      )
    })

    it('with no valid key', async () => {
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, await tokenOwner.getAddress())
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, await tokenOwner.getAddress())
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )
    })
  })

  describe('mapping is set, account holds just as much as necessary', () => {
    beforeEach(async () => {
      // mint one token
      await token.mint(await tokenOwner.getAddress(), minAmount)
      // create mapping
      await hook.createMapping(
        await lock.getAddress(),
        await token.getAddress(),
        minAmount
      )
    })

    it('with no valid key', async () => {
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, await tokenOwner.getAddress())
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, await tokenOwner.getAddress())
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(
        await lock.getHasValidKey(await tokenOwner.getAddress()),
        true
      )
    })
  })
})
