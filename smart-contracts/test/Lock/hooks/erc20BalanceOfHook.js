const { ethers } = require('hardhat')
const { constants } = require('hardlydifficult-ethereum-contracts')
const { reverts } = require('../../helpers/errors')

const deployLocks = require('../../helpers/deployLocks')
const getProxy = require('../../helpers/proxy')

const unlockContract = artifacts.require('Unlock.sol')
const Erc20TokenUriHook = artifacts.require('ERC20BalanceOfHook')
const TestERC20 = artifacts.require('TestERC20')

let lock
let unlock
let hook
let token

const minAmount = ethers.utils.parseEther('0.05')

contract('ERC20BalanceOfHook', (accounts) => {
  const from = accounts[1]
  const tokenOwner = accounts[2]
  const keyOwner = accounts[3]

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST

    // deploy some ERC20
    token = await TestERC20.new()

    // deploy the hook
    hook = await Erc20TokenUriHook.new()

    // set the hook
    await lock.setEventHooks(
      constants.ZERO_ADDRESS,
      constants.ZERO_ADDRESS,
      hook.address,
      constants.ZERO_ADDRESS
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
        hook.createMapping(
          constants.ZERO_ADDRESS,
          token.address,
          minAmount.toString()
        ),
        'Lock address can not be zero'
      )
      await reverts(
        hook.createMapping(
          lock.address,
          constants.ZERO_ADDRESS,
          minAmount.toString()
        ),
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
      const keyPrice = await lock.keyPrice()
      await lock.purchase(
        [],
        [keyOwner],
        [constants.ZERO_ADDRESS],
        [constants.ZERO_ADDRESS],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(keyOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const keyPrice = await lock.keyPrice()
      const tx = await lock.purchase(
        [],
        [keyOwner],
        [constants.ZERO_ADDRESS],
        [constants.ZERO_ADDRESS],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(keyOwner), true)

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId } = args

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
      const keyPrice = await lock.keyPrice()
      await lock.purchase(
        [],
        [tokenOwner],
        [constants.ZERO_ADDRESS],
        [constants.ZERO_ADDRESS],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const keyPrice = await lock.keyPrice()
      const tx = await lock.purchase(
        [],
        [tokenOwner],
        [constants.ZERO_ADDRESS],
        [constants.ZERO_ADDRESS],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(tokenOwner), true)

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId } = args

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
      const keyPrice = await lock.keyPrice()
      await lock.purchase(
        [],
        [tokenOwner],
        [constants.ZERO_ADDRESS],
        [constants.ZERO_ADDRESS],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const keyPrice = await lock.keyPrice()
      const tx = await lock.purchase(
        [],
        [tokenOwner],
        [constants.ZERO_ADDRESS],
        [constants.ZERO_ADDRESS],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(tokenOwner), true)

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId } = args

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
      const keyPrice = await lock.keyPrice()
      await lock.purchase(
        [],
        [tokenOwner],
        [constants.ZERO_ADDRESS],
        [constants.ZERO_ADDRESS],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const keyPrice = await lock.keyPrice()
      const tx = await lock.purchase(
        [],
        [tokenOwner],
        [constants.ZERO_ADDRESS],
        [constants.ZERO_ADDRESS],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(tokenOwner), true)

      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId } = args

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(tokenOwner), true)
    })
  })
})
