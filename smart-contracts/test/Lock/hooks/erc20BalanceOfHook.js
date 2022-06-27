const { ethers } = require('hardhat')

const {
  reverts,
  ADDRESS_ZERO,
  purchaseKey,
  deployLock,
} = require('../../helpers')

const Erc20TokenUriHook = artifacts.require('ERC20BalanceOfHook')
const TestERC20 = artifacts.require('TestERC20')

let lock
let hook
let token

const minAmount = ethers.utils.parseEther('0.05')

contract('ERC20BalanceOfHook', (accounts) => {
  const tokenOwner = accounts[2]
  const keyOwner = accounts[3]

  beforeEach(async () => {
    lock = await deployLock()

    // deploy some ERC20
    token = await TestERC20.new()

    // deploy the hook
    hook = await Erc20TokenUriHook.new()

    // set the hook
    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      hook.address,
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
      assert.equal(
        (await hook.minAmounts(lock.address)).toString(),
        minAmount.toString()
      )
    })
    it('should only allow lock managers to set mapping', async () => {
      await reverts(
        hook.createMapping(lock.address, token.address, minAmount.toString(), {
          from: accounts[5],
        }),
        'Caller does not have the LockManager role'
      )
    })
    it('throws on zero addresses', async () => {
      await reverts(
        hook.createMapping(ADDRESS_ZERO, token.address, minAmount.toString()),
        'Lock address can not be zero'
      )
      await reverts(
        hook.createMapping(lock.address, ADDRESS_ZERO, minAmount.toString()),
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
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, keyOwner)
      assert.equal(await lock.getHasValidKey(keyOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, keyOwner)
      assert.equal(await lock.getHasValidKey(keyOwner), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
  })

  describe('mapping is set, account holds less than necessary', () => {
    beforeEach(async () => {
      // mint one token
      await token.mint(tokenOwner, ethers.utils.parseEther('0.01'))
      // create mapping
      await hook.createMapping(lock.address, token.address, minAmount)
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(tokenOwner), false)
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, tokenOwner)
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, tokenOwner)
      assert.equal(await lock.getHasValidKey(tokenOwner), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(tokenOwner), false)
    })
  })

  describe('mapping is set, account holds more than necessary', () => {
    beforeEach(async () => {
      // mint one token
      await token.mint(tokenOwner, ethers.utils.parseEther('0.5'))
      // create mapping
      await hook.createMapping(lock.address, token.address, minAmount)
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, tokenOwner)
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, tokenOwner)
      assert.equal(await lock.getHasValidKey(tokenOwner), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
  })

  describe('mapping is set, account holds just as much as necessary', () => {
    beforeEach(async () => {
      // mint one token
      await token.mint(tokenOwner, minAmount)
      // create mapping
      await hook.createMapping(lock.address, token.address, minAmount)
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, tokenOwner)
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, tokenOwner)
      assert.equal(await lock.getHasValidKey(tokenOwner), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
  })
})
