const {
  deployLock,
  ADDRESS_ZERO,
  purchaseKey,
  reverts,
} = require('../../helpers')
const Erc721TokenUriHook = artifacts.require('ERC721BalanceOfHook')
const TestERC721 = artifacts.require('TestERC721')

let lock
let hook
let nft

contract('ERC721BalanceOfHook', (accounts) => {
  const from = accounts[1]
  const nftOwner = accounts[2]
  const keyOwner = accounts[3]

  beforeEach(async () => {
    lock = await deployLock()

    // deploy some ERC721
    nft = await TestERC721.new()

    // deploy the hook
    hook = await Erc721TokenUriHook.new()

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
        hook.createMapping(ADDRESS_ZERO, nft.address),
        'Lock address can not be zero'
      )
      await reverts(
        hook.createMapping(lock.address, ADDRESS_ZERO),
        'ERC721 address can not be zero'
      )
    })
  })

  describe('mapping is not set', () => {
    it('mapping not set', async () => {
      assert.notEqual(await hook.nftAddresses(lock.address), nft.address)
    })
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
      const { tokenId } = await purchaseKey(lock, keyOwner)
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.getHasValidKey(keyOwner), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.isValidKey(tokenId), false)
      assert.equal(await lock.balanceOf(keyOwner), 0)
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
  })

  describe('mapping is set, account holds a nft', () => {
    beforeEach(async () => {
      // mint one token
      await nft.mint(nftOwner)
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(nftOwner), false)
      assert.equal(await lock.balanceOf(nftOwner), 0)
      // create mapping
      await hook.createMapping(lock.address, nft.address)
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
    it('with a valid key', async () => {
      assert.equal(await lock.getHasValidKey(nftOwner), false)

      // buy a key
      await purchaseKey(lock, nftOwner)
      assert.equal(await lock.balanceOf(nftOwner), 1)
      assert.equal(await lock.getHasValidKey(nftOwner), true)

      // create mapping
      await hook.createMapping(lock.address, nft.address)
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
    it('with an expired key', async () => {
      assert.equal(await lock.getHasValidKey(nftOwner), false)

      // buy a key
      const { tokenId } = await purchaseKey(lock, nftOwner)
      assert.equal(await lock.balanceOf(nftOwner), 1)
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.getHasValidKey(nftOwner), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.isValidKey(tokenId), false)
      assert.equal(await lock.balanceOf(nftOwner), 0)
      assert.equal(await lock.getHasValidKey(nftOwner), false)

      await hook.createMapping(lock.address, nft.address)
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
  })

  describe('mapping is set, account does not hold a nft', () => {
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
})
