const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  deployLock,
  deployERC20,
  ADDRESS_ZERO,
  MAX_UINT,
  reverts,
  purchaseKey,
} = require('../helpers')

describe('Lock / erc20', () => {
  let token
  let lock
  let lockOwner, keyOwner, keyOwner2, keyOwner3, anotherAccount

  beforeEach(async () => {
    ;[lockOwner, keyOwner, keyOwner2, keyOwner3, anotherAccount] =
      await ethers.getSigners()
    token = await deployERC20(lockOwner.address)

    // Mint some tokens so that the totalSupply is greater than 0
    await token.mint(lockOwner.address, 1)
    lock = await deployLock({ tokenAddress: token.address })
    await lock.setMaxKeysPerAddress(10)
  })

  describe('creating ERC20 priced locks', () => {
    let keyPrice
    let refundAmount
    const defaultBalance = ethers.utils.parseEther('100')

    beforeEach(async () => {
      // Pre-req
      assert.equal(await token.balanceOf(keyOwner.address), 0)
      assert.equal(await token.balanceOf(lock.address), 0)

      // Mint some tokens for testing
      await token.mint(keyOwner.address, defaultBalance)
      await token.mint(keyOwner2.address, defaultBalance)
      await token.mint(keyOwner3.address, defaultBalance)

      // Approve the lock to make transfers
      await token.connect(keyOwner).approve(lock.address, MAX_UINT)
      await token.connect(keyOwner2).approve(lock.address, MAX_UINT)
      await token.connect(keyOwner3).approve(lock.address, MAX_UINT)

      keyPrice = await lock.keyPrice()
      refundAmount = keyPrice
    })

    describe('users can purchase keys', () => {
      let tokenId
      beforeEach(async () => {
        ;({ tokenId } = await purchaseKey(lock, keyOwner, true))
      })

      it('charges correct amount on purchaseKey', async () => {
        const balance = await token.balanceOf(keyOwner.address)
        assert.equal(
          balance.toString(),
          defaultBalance.sub(keyPrice).toString()
        )
      })

      it('transferred the tokens to the contract', async () => {
        const balance = await token.balanceOf(lock.address)
        assert.equal(balance.toString(), keyPrice.toString())
      })

      it('when a lock owner refunds a key, tokens are fully refunded', async () => {
        const { tokenId } = await purchaseKey(lock, keyOwner3, true)

        const balanceOwnerBefore = await token.balanceOf(keyOwner3.address)
        const balanceLockBefore = await token.balanceOf(lock.address)

        await lock.expireAndRefundFor(tokenId, refundAmount)
        const balanceOwnerAfter = await token.balanceOf(keyOwner3.address)
        const balanceLockAfter = await token.balanceOf(lock.address)

        assert.equal(
          balanceLockBefore.sub(keyPrice).toString(),
          balanceLockAfter.toString()
        )

        assert.equal(
          balanceOwnerBefore.add(keyPrice).toString(),
          balanceOwnerAfter.toString()
        )
      })

      it('when a key owner cancels a key, they are refunded in tokens', async () => {
        const balance = await token.balanceOf(keyOwner.address)
        await lock.connect(keyOwner).cancelAndRefund(tokenId)
        assert(balance.lt(await token.balanceOf(keyOwner.address)))
      })

      it('the owner can withdraw tokens', async () => {
        const lockBalance = await token.balanceOf(lock.address)
        const ownerBalance = await token.balanceOf(lockOwner.address)

        await lock.withdraw(await lock.tokenAddress(), 0)

        assert.equal(await token.balanceOf(lock.address), 0)
        assert.equal(
          await token.balanceOf(lockOwner.address),
          ownerBalance.add(lockBalance).toString()
        )
      })

      it('purchaseForFrom works as well', async () => {
        // The referrer needs a valid key for this test
        await lock
          .connect(keyOwner)
          .purchase(
            [keyPrice.toString()],
            [keyOwner.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]]
          )
        const balanceBefore = await token.balanceOf(keyOwner2.address)

        await lock
          .connect(keyOwner2)
          .purchase(
            [keyPrice.toString()],
            [keyOwner2.address],
            [keyOwner.address],
            [ADDRESS_ZERO],
            [[]]
          )

        const balance = await token.balanceOf(keyOwner2.address)
        assert.equal(balance.toString(), balanceBefore.sub(keyPrice).toString())
      })

      it('can transfer the key to another user', async () => {
        await lock
          .connect(keyOwner)
          .transferFrom(keyOwner.address, anotherAccount.address, tokenId)
      })
    })

    it('purchaseKey fails when the user does not have enough funds', async () => {
      await token.connect(anotherAccount).approve(lock.address, MAX_UINT)
      await token.mint(anotherAccount.address, keyPrice.sub(1))
      await reverts(
        lock
          .connect(anotherAccount)
          .purchase(
            [keyPrice.toString()],
            [anotherAccount.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]]
          )
      )
    })

    it('purchaseKey fails when the user did not give the contract an allowance', async () => {
      await token.mint(anotherAccount.address, keyPrice)
      await reverts(
        lock
          .connect(anotherAccount)
          .purchase(
            [keyPrice.toString()],
            [anotherAccount.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]]
          )
      )
    })
  })

  describe('should fail to create a lock when', () => {
    it('when creating a lock for a contract which is not an ERC20', async () => {
      const TestNoop = await ethers.getContractFactory('TestNoop')
      const noop = await TestNoop.deploy()
      await noop.deployed()

      await reverts(
        deployLock({
          tokenAddress: noop.address,
        })
      )
    })

    describe('when creating a lock with an invalid ERC20', () => {
      // TODO: testing this requires using web3 instead of truffle methods
      // (truffle fails with `no code at address`)
    })
  })

  describe('when the ERC20 is paused', () => {
    // TODO: testing this requires creating a new test-artifact with pause capabilities
  })
})
