const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployLock,
  ADDRESS_ZERO,
  purchaseKey,
  reverts,
} = require('../../helpers')

let lock
let hook
let nft

describe('ERC721BalanceOfHook', () => {
  let nftOwner
  let keyOwner
  let randomSigner

  beforeEach(async () => {
    ;[, { address: nftOwner }, { address: keyOwner }, randomSigner] =
      await ethers.getSigners()
    const Erc721TokenUriHook = await ethers.getContractFactory(
      'ERC721BalanceOfHook'
    )
    const TestERC721 = await ethers.getContractFactory('TestERC721')

    lock = await deployLock({ isEthers: true })

    // deploy some ERC721
    nft = await TestERC721.deploy()

    // deploy the hook
    hook = await Erc721TokenUriHook.deploy()

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
      await hook.createMapping(await lock.getAddress(), await nft.getAddress())
    })
    it('should record the corresponding erc721 address', async () => {
      assert.equal(
        await hook.nftAddresses(await lock.getAddress()),
        await nft.getAddress()
      )
    })
    it('should only allow lock managers to set mapping', async () => {
      await reverts(
        hook
          .connect(randomSigner)
          .createMapping(await lock.getAddress(), await nft.getAddress()),
        'Caller does not have the LockManager role'
      )
    })
    it('throws on zero addresses', async () => {
      await reverts(
        hook.createMapping(ADDRESS_ZERO, await nft.getAddress()),
        'Lock address can not be zero'
      )
      await reverts(
        hook.createMapping(await lock.getAddress(), ADDRESS_ZERO),
        'ERC721 address can not be zero'
      )
    })
  })

  describe('mapping is not set', () => {
    it('mapping not set (fails)', async () => {
      assert.notEqual(
        await hook.nftAddresses(await lock.getAddress()),
        await nft.getAddress()
      )
    })
    it('with no valid key (fails)', async () => {
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
    it('with a valid key (works)', async () => {
      // buy a key
      const keyPrice = await lock.keyPrice()
      await lock.purchase(
        [],
        [keyOwner],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        ['0x'],
        {
          value: keyPrice,
        }
      )
      assert.equal(await lock.getHasValidKey(keyOwner), true)
    })
    it('with an expired key (fails)', async () => {
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

    it('with no valid key (works)', async () => {
      assert.equal(await lock.getHasValidKey(nftOwner), false)
      assert.equal(await lock.balanceOf(nftOwner), 0)
      // create mapping
      await hook.createMapping(await lock.getAddress(), await nft.getAddress())
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
    it('with a valid key (works)', async () => {
      assert.equal(await lock.getHasValidKey(nftOwner), false)

      // buy a key
      await purchaseKey(lock, nftOwner)
      assert.equal(await lock.balanceOf(nftOwner), 1)
      assert.equal(await lock.getHasValidKey(nftOwner), true)

      // create mapping
      await hook.createMapping(await lock.getAddress(), await nft.getAddress())
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
    it('with an expired key (works)', async () => {
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

      await hook.createMapping(await lock.getAddress(), await nft.getAddress())
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
  })

  describe('mapping is set, account does not hold a nft', () => {
    it('with no valid key (fails)', async () => {
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
    it('with a valid key (works)', async () => {
      // buy a key
      await purchaseKey(lock, keyOwner)
      assert.equal(await lock.getHasValidKey(keyOwner), true)
    })
    it('with an expired key (fails)', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, keyOwner)
      assert.equal(await lock.getHasValidKey(keyOwner), true)

      // expire the key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
  })
})
