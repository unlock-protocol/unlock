const assert = require('assert')
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
    await token.connect(deployer).mint(await deployer.getAddress(), 1)
    lock = await deployLock({
      tokenAddress: await token.getAddress(),
      isEthers: true,
    })
  })

  describe('creating ERC20 priced locks', () => {
    let keyPrice
    let refundAmount

    const defaultBalance = BigInt('100000000000000000')

    beforeEach(async () => {
      // Pre-req
      assert.equal(await token.balanceOf(await keyOwner.getAddress()), 0)
      assert.equal(await token.balanceOf(await lock.getAddress()), 0)

      // Mint some tokens for testing
      await token
        .connect(deployer)
        .mint(await keyOwner.getAddress(), defaultBalance)
      await token
        .connect(deployer)
        .mint(await keyOwner2.getAddress(), defaultBalance)
      await token
        .connect(deployer)
        .mint(await keyOwner3.getAddress(), defaultBalance)

      // Approve the lock to make transfers
      await token.connect(keyOwner).approve(await lock.getAddress(), MAX_UINT)
      await token.connect(keyOwner2).approve(await lock.getAddress(), MAX_UINT)
      await token.connect(keyOwner3).approve(await lock.getAddress(), MAX_UINT)

      keyPrice = await lock.keyPrice()
      refundAmount = keyPrice
    })

    describe('users can purchase keys', () => {
      let tokenId
      beforeEach(async () => {
        ;({ tokenId } = await purchaseKey(
          lock,
          await keyOwner.getAddress(),
          true
        ))
      })

      it('charges correct amount on purchaseKey', async () => {
        const balance = await token.balanceOf(await keyOwner.getAddress())
        compareBigNumbers(balance, defaultBalance - keyPrice)
      })

      it('transferred the tokens to the contract', async () => {
        const balance = await token.balanceOf(await lock.getAddress())
        compareBigNumbers(balance, keyPrice)
      })

      it('when a lock owner refunds a key, tokens are fully refunded', async () => {
        const { tokenId } = await purchaseKey(
          lock,
          await keyOwner3.getAddress(),
          true
        )

        const balanceOwnerBefore = await token.balanceOf(
          await keyOwner3.getAddress()
        )
        const balanceLockBefore = await token.balanceOf(await lock.getAddress())

        await lock
          .connect(lockManager)
          .expireAndRefundFor(tokenId, refundAmount)
        const balanceOwnerAfter = await token.balanceOf(
          await keyOwner3.getAddress()
        )
        const balanceLockAfter = await token.balanceOf(await lock.getAddress())

        compareBigNumbers(balanceLockBefore - keyPrice, balanceLockAfter)

        compareBigNumbers(balanceOwnerBefore + keyPrice, balanceOwnerAfter)
      })

      it('when a key owner cancels a key, they are refunded in tokens', async () => {
        const balance = await token.balanceOf(await keyOwner.getAddress())
        await lock.connect(keyOwner).cancelAndRefund(tokenId)
        assert(balance < (await token.balanceOf(await keyOwner.getAddress())))
      })

      it('the owner can withdraw tokens', async () => {
        const lockBalance = await token.balanceOf(await lock.getAddress())
        const ownerBalance = await token.balanceOf(await deployer.getAddress())

        await lock
          .connect(lockManager)
          .withdraw(await lock.tokenAddress(), await deployer.getAddress(), 0)

        compareBigNumbers(await token.balanceOf(await lock.getAddress()), 0)
        compareBigNumbers(
          await token.balanceOf(await deployer.getAddress()),
          ownerBalance + lockBalance
        )
      })

      it('purchaseForFrom works as well', async () => {
        const { address: referrer } = keyOwner
        // The referrer needs a valid key for this test
        await lock
          .connect(keyOwner)
          .purchase(
            [referrer],
            [await keyOwner.getAddress()],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            ['0x']
          )
        const balanceBefore = await token.balanceOf(
          await keyOwner2.getAddress()
        )

        await lock
          .connect(keyOwner2)
          .purchase(
            [keyPrice],
            [await keyOwner2.getAddress()],
            [referrer],
            [ADDRESS_ZERO],
            ['0x']
          )

        const balance = await token.balanceOf(await keyOwner2.getAddress())
        compareBigNumbers(balance, balanceBefore - keyPrice)
      })

      it('can transfer the key to another user', async () => {
        await lock
          .connect(keyOwner)
          .transferFrom(
            await keyOwner.getAddress(),
            await random.getAddress(),
            tokenId
          )
      })
    })

    it('purchaseKey fails when the user does not have enough funds', async () => {
      await token.connect(random).approve(await lock.getAddress(), MAX_UINT)
      await token
        .connect(deployer)
        .mint(await random.getAddress(), keyPrice - 1n)
      await reverts(
        lock
          .connect(random)
          .purchase(
            [keyPrice],
            [await random.getAddress()],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            ['0x']
          )
      )
    })

    it('purchaseKey fails when the user did not give the contract an allowance', async () => {
      await token.connect(deployer).mint(await random.getAddress(), keyPrice)
      await reverts(
        lock
          .connect(random)
          .purchase(
            [keyPrice],
            [await random.getAddress()],
            [ADDRESS_ZERO],
            [ADDRESS_ZERO],
            ['0x']
          )
      )
    })
  })

  describe('should fail to create a lock when', () => {
    it('when creating a lock for a contract which is not an ERC20', async () => {
      const NonToken = await ethers.getContractFactory('TestNoop')
      const nonToken = await NonToken.deploy()
      await reverts(
        deployLock({
          tokenAddress: await nonToken.getAddress(),
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
