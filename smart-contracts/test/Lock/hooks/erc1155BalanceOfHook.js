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

const GOLD = 1

describe('ERC1155BalanceOfHook', () => {
  let nftOwner
  let keyOwner
  let randomSigner

  beforeEach(async () => {
    ;[, { address: nftOwner }, { address: keyOwner }, randomSigner] =
      await ethers.getSigners()

    lock = await deployLock({ isEthers: true })

    // deploy some ERC1155
    const TestERC1155 = await ethers.getContractFactory('TestERC1155')
    nft = await TestERC1155.deploy()

    // deploy the hook
    const Erc1155TokenUriHook = await ethers.getContractFactory(
      'ERC1155BalanceOfHook'
    )
    hook = await Erc1155TokenUriHook.deploy()

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
        await nft.getAddress(),
        GOLD
      )
    })

    it('should record the corresponding NFT address', async () => {
      assert.equal(
        await hook.nftAddresses(await lock.getAddress()),
        await nft.getAddress()
      )
    })

    it('should record the corresponding token type', async () => {
      assert.equal(await hook.nftTokenIds(await lock.getAddress()), GOLD)
    })

    it('should only allow lock managers to set mapping', async () => {
      await reverts(
        hook
          .connect(randomSigner)
          .createMapping(await lock.getAddress(), await nft.getAddress(), GOLD),
        'Caller does not have the LockManager role'
      )
    })
    it('throws on zero addresses', async () => {
      await reverts(
        hook.createMapping(ADDRESS_ZERO, await nft.getAddress(), GOLD),
        'Lock address can not be zero'
      )
      await reverts(
        hook.createMapping(await lock.getAddress(), ADDRESS_ZERO, GOLD),
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
        ['0x'],
        {
          value: keyPrice,
        }
      )
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

  describe('mapping is set, account holds a nft', () => {
    beforeEach(async () => {
      // mint one token
      await nft.mint(nftOwner, GOLD)
      // create mapping
      await hook.createMapping(
        await lock.getAddress(),
        await nft.getAddress(),
        GOLD
      )
    })

    it('with no valid key', async () => {
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
    it('with a valid key', async () => {
      // buy a key
      await purchaseKey(lock, keyOwner)
      assert.equal(await lock.getHasValidKey(nftOwner), true)
    })
    it('with an expired key', async () => {
      // buy a key
      const { tokenId } = await purchaseKey(lock, keyOwner)
      assert.equal(await lock.getHasValidKey(nftOwner), true)

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
