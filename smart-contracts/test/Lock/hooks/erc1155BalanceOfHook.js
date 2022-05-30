const { reverts } = require('truffle-assertions')
const deployLocks = require('../../helpers/deployLocks')

const { ADDRESS_ZERO } = require('../../helpers/constants')

const unlockContract = artifacts.require('Unlock.sol')
const Erc1155TokenUriHook = artifacts.require('ERC1155BalanceOfHook')
const TestERC1155 = artifacts.require('TestERC1155')
const getProxy = require('../../helpers/proxy')

let lock
let unlock
let hook
let nft

const GOLD = 1

contract('ERC1155BalanceOfHook', (accounts) => {
  const from = accounts[1]
  const nftOwner = accounts[2]
  const keyOwner = accounts[3]

  beforeEach(async () => {
    unlock = await getProxy(unlockContract)
    const locks = await deployLocks(unlock, accounts[0])
    lock = locks.FIRST

    // deploy some ERC1155
    nft = await TestERC1155.new()

    // deploy the hook
    hook = await Erc1155TokenUriHook.new()

    // set the hook
    await lock.setEventHooks(
      ADDRESS_ZERO,
      ADDRESS_ZERO,
      hook.address,
      ADDRESS_ZERO
    )
  })

  describe('setting mapping', () => {
    beforeEach(async () => {
      await hook.createMapping(lock.address, nft.address, GOLD)
    })

    it('should record the corresponding NFT address', async () => {
      assert.equal(await hook.nftAddresses(lock.address), nft.address)
    })

    it('should record the corresponding token type', async () => {
      assert.equal(await hook.nftTokenIds(lock.address), GOLD)
    })

    it('should only allow lock managers to set mapping', async () => {
      await reverts(
        hook.createMapping(lock.address, nft.address, GOLD, {
          from: accounts[5],
        }),
        'Caller does not have the LockManager role'
      )
    })
    it('throws on zero addresses', async () => {
      await reverts(
        hook.createMapping(ADDRESS_ZERO, nft.address, GOLD),
        'Lock address can not be zero'
      )
      await reverts(
        hook.createMapping(lock.address, ADDRESS_ZERO, GOLD),
        'ERC1155 address can not be zero'
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
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
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
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId } = args

      assert.equal(await lock.getHasValidKey(keyOwner), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
  })

  describe('mapping is set, account holds a nft', () => {
    beforeEach(async () => {
      // mint one token
      await nft.mint(nftOwner, GOLD)
      // create mapping
      await hook.createMapping(lock.address, nft.address, GOLD)
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
    it('with a valid key', async () => {
      // buy a key
      const keyPrice = await lock.keyPrice()
      await lock.purchase(
        [],
        [nftOwner],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
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
      const tx = await lock.purchase(
        [],
        [nftOwner],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          from,
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(nftOwner), true)
      const { args } = tx.logs.find((v) => v.event === 'Transfer')
      const { tokenId } = args

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
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
        [],
        [keyOwner],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
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
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
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
})
