const { constants } = require('hardlydifficult-ethereum-contracts')
const { reverts } = require('truffle-assertions')
const deployLocks = require('../helpers/deployLocks')

const unlockContract = artifacts.require('Unlock.sol')
const Erc721TokenUriHook = artifacts.require('ERC721BalanceOfHook')
const TestERC721 = artifacts.require('TestERC721')
const getProxy = require('../helpers/proxy')

let lock
let unlock
let hook
let nft

contract('ERC721BalanceOfHook', (accounts) => {
  const from = accounts[1]
  const nftOwner = accounts[2]
  const keyOwner = accounts[3]

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST

    // deploy some ERC721
    nft = await TestERC721.new()

    // deploy the hook
    hook = await Erc721TokenUriHook.new()

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
      await hook.createMapping(lock.address, nft.address)
    })
    it('should record the corresponding erc721 address', async () => {
      assert.equal(await hook.nftAddresses(lock.address), nft.address)
    })
    it('should only allow lock managers to set mapping', async () => {
      await reverts(
        hook.createMapping(lock.address, nft.address, { from: accounts[5] }),
        'Caller does not have the LockManager role'
      )
    })
    it('throws on zero addresses', async () => {
      await reverts(
        hook.createMapping(constants.ZERO_ADDRESS, nft.address),
        'Lock address can not be zero'
      )
      await reverts(
        hook.createMapping(lock.address, constants.ZERO_ADDRESS),
        'ERC721 address can not be zero'
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
        0,
        keyOwner,
        constants.ZERO_ADDRESS,
        constants.ZERO_ADDRESS,
        [],
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
      await lock.purchase(
        0,
        keyOwner,
        constants.ZERO_ADDRESS,
        constants.ZERO_ADDRESS,
        [],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(keyOwner), true)

      // expire the key
      await lock.expireAndRefundFor(keyOwner, 0)
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
  })

  describe('mapping is set, account holds a nft', () => {
    beforeEach(async () => {
      // mint one token
      await nft.mint(nftOwner)
      // create mapping
      await hook.createMapping(lock.address, nft.address)
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
    it('with a valid key', async () => {
      // buy a key
      const keyPrice = await lock.keyPrice()
      await lock.purchase(
        0,
        nftOwner,
        constants.ZERO_ADDRESS,
        constants.ZERO_ADDRESS,
        [],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const keyPrice = await lock.keyPrice()
      await lock.purchase(
        0,
        nftOwner,
        constants.ZERO_ADDRESS,
        constants.ZERO_ADDRESS,
        [],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(nftOwner), true)

      // expire the key
      await lock.expireAndRefundFor(nftOwner, 0)
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
  })

  describe('mapping is set, account does not hold a nft', () => {
    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
    it('with a valid key', async () => {
      // buy a key
      const keyPrice = await lock.keyPrice()
      await lock.purchase(
        0,
        keyOwner,
        constants.ZERO_ADDRESS,
        constants.ZERO_ADDRESS,
        [],
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
      await lock.purchase(
        0,
        keyOwner,
        constants.ZERO_ADDRESS,
        constants.ZERO_ADDRESS,
        [],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(keyOwner), true)

      // expire the key
      await lock.expireAndRefundFor(keyOwner, 0)
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
  })
})
