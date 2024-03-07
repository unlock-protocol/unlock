const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  deployLock,
  deployERC20,

  reverts,
  purchaseKey,
  compareBigNumbers,
} = require('../helpers')
const { ADDRESS_ZERO, MAX_UINT } = require('@unlock-protocol/hardhat-helpers')

describe('Lock / erc20', () => {
  let token
  let lock
  let lockManager, deployer, keyOwner, keyOwner2, keyOwner3, random

  beforeEach(async () => {
    ;[lockManager, deployer, keyOwner, keyOwner2, keyOwner3, random] =
      await ethers.getSigners()
    token = await deployERC20(deployer, true)
    // Mint some tokens so that the totalSupply is greater than 0
    await token.connect(deployer).mint(deployer.address, 1)
    lock = await deployLock({ tokenAddress: token.address, isEthers: true })
  })

  describe('creating ERC20 priced locks', () => {
    let keyPrice
    let refundAmount

    const defaultBalance = ethers.BigNumber.from('100000000000000000')

    beforeEach(async () => {
      // Pre-req
      assert.equal(await token.balanceOf(keyOwner.address), 0)
      assert.equal(await token.balanceOf(lock.address), 0)

      // Mint some tokens for testing
      await token.connect(deployer).mint(keyOwner.address, defaultBalance)
      await token.connect(deployer).mint(keyOwner2.address, defaultBalance)
      await token.connect(deployer).mint(keyOwner3.address, defaultBalance)

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
        ;({ tokenId } = await purchaseKey(lock, keyOwner.address, true))
      })

      it('charges correct amount on purchaseKey', async () => {
        const balance = await token.balanceOf(keyOwner.address)
        compareBigNumbers(balance, defaultBalance.sub(keyPrice))
      })

      it('transferred the tokens to the contract', async () => {
        const balance = await token.balanceOf(lock.address)
        compareBigNumbers(balance, keyPrice)
      })

      it('when a lock owner refunds a key, tokens are fully refunded', async () => {
        const { tokenId } = await purchaseKey(lock, keyOwner3.address, true)

        const balanceOwnerBefore = await token.balanceOf(keyOwner3.address)
        const balanceLockBefore = await token.balanceOf(lock.address)

        await lock
          .connect(lockManager)
          .expireAndRefundFor(tokenId, refundAmount)
        const balanceOwnerAfter = await token.balanceOf(keyOwner3.address)
        const balanceLockAfter = await token.balanceOf(lock.address)

        compareBigNumbers(balanceLockBefore.sub(keyPrice), balanceLockAfter)

        compareBigNumbers(balanceOwnerBefore.add(keyPrice), balanceOwnerAfter)
      })

      it('when a key owner cancels a key, they are refunded in tokens', async () => {
        const balance = await token.balanceOf(keyOwner.address)
        await lock.connect(keyOwner).cancelAndRefund(tokenId)
        assert(balance.lt(await token.balanceOf(keyOwner.address)))
      })

      it('the owner can withdraw tokens', async () => {
        const lockBalance = await token.balanceOf(lock.address)
        const ownerBalance = await token.balanceOf(deployer.address)

        await lock
          .connect(lockManager)
          .withdraw(await lock.tokenAddress(), deployer.address, 0)

        compareBigNumbers(await token.balanceOf(lock.address), 0)
        compareBigNumbers(
          await token.balanceOf(deployer.address),
          ownerBalance.add(lockBalance)
        )
      })

      it('purchaseForFrom works as well', async () => {
        const { address: referrer } = keyOwner
        // The referrer needs a valid key for this test
        await lock
          .connect(keyOwner)
          .purchase(
            [referrer],
            [keyOwner.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]]
          )
        const balanceBefore = await token.balanceOf(keyOwner2.address)

        await lock
          .connect(keyOwner2)
          .purchase(
            [keyPrice],
            [keyOwner2.address],
            [referrer],
            [ADDRESS_ZERO],
            [[]]
          )

        const balance = await token.balanceOf(keyOwner2.address)
        compareBigNumbers(balance, balanceBefore.sub(keyPrice))
      })

      it('can transfer the key to another user', async () => {
        await lock
          .connect(keyOwner)
          .transferFrom(keyOwner.address, random.address, tokenId)
      })
    })

    it('purchaseKey fails when the user does not have enough funds', async () => {
      await token.connect(random).approve(lock.address, MAX_UINT)
      await token.connect(deployer).mint(random.address, keyPrice.sub(1))
      await reverts(
        lock
          .connect(random)
          .purchase(
            [keyPrice],
            [random.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]]
          )
      )
    })

    it('purchaseKey fails when the user did not give the contract an allowance', async () => {
      await token.connect(deployer).mint(random.address, keyPrice)
      await reverts(
        lock
          .connect(random)
          .purchase(
            [keyPrice],
            [random.address],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            [[]]
          )
      )
    })
  })

  describe('should fail to create a lock when', () => {
    it('when creating a lock for a contract which is not an ERC20', async () => {
      const nonToken = await ethers.getContractFactory('TestNoop')
      await reverts(
        deployLock({
          tokenAddress: (await nonToken.deploy()).address,
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
