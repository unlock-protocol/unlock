const { ethers } = require('hardhat')
const assert = require('assert')
const { ADDRESS_ZERO, getEvent } = require('@unlock-protocol/hardhat-helpers')
const {
  deployLock,
  deployERC20,
  getBalance,
  purchaseKey,
  reverts,
} = require('../helpers')

let token
let tokenId, anotherTokenId

const BASIS_POINTS = 10000n

describe('Lock / cancelAndRefund', () => {
  let lock
  let lockFree
  let lockCreator, keyOwner, anotherKeyOwner, receiver, attacker
  const keyPrice = ethers.parseUnits('0.01', 'ether')

  before(async () => {
    ;[lockCreator, keyOwner, anotherKeyOwner, receiver, attacker] =
      await ethers.getSigners()
    token = await deployERC20(await lockCreator.getAddress(), true)
    await token.mint(await lockCreator.getAddress(), 100)
    lock = await deployLock()
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    ;({ tokenId: anotherTokenId } = await purchaseKey(
      lock,
      await anotherKeyOwner.getAddress()
    ))
  })

  describe('refunds', () => {
    it('should return the correct penalty', async () => {
      const numerator = await lock.refundPenaltyBasisPoints()
      assert.equal(BASIS_POINTS / numerator, 10) // default of 10%
    })

    it('the amount of refund should be less than the original keyPrice when purchased normally', async () => {
      const estimatedRefund = await lock.getCancelAndRefundValue(tokenId)
      assert(estimatedRefund < keyPrice)
    })

    it('the amount of refund should be less than the original keyPrice when expiration is very far in the future', async () => {
      const tx = await lock.grantKeys(
        [await receiver.getAddress()],
        [999999999999],
        [ADDRESS_ZERO]
      )
      const receipt = await tx.wait()
      const { args } = await getEvent(receipt, 'Transfer')
      const estimatedRefund = await lock.getCancelAndRefundValue(args.tokenId)
      assert(estimatedRefund < keyPrice)
    })

    it('should refund in the new token after token address is changed', async () => {
      // Confirm user has a key paid in eth
      assert.equal(
        await lock.getHasValidKey(await anotherKeyOwner.getAddress()),
        true
      )
      assert.equal(await lock.tokenAddress(), 0)
      // check user's token balance
      assert.equal(await token.balanceOf(await anotherKeyOwner.getAddress()), 0)
      // update token address and price
      await lock.updateKeyPricing(11, await token.getAddress())
      // fund lock with new erc20 tokens to deal enable refunds
      await token.mint(await lock.getAddress(), 100)
      assert.equal(await token.balanceOf(await lock.getAddress()), 100)
      // cancel and refund
      await lock.connect(anotherKeyOwner).cancelAndRefund(anotherTokenId)
      // check user's token balance
      assert((await token.balanceOf(await anotherKeyOwner.getAddress())) > 0)
    })
  })

  describe('should cancel and refund when enough time remains', () => {
    let initialLockBalance
    let initialKeyOwnerBalance
    let estimatedRefund
    let event, refund
    let withdrawalAmount
    let txFee

    before(async () => {
      initialLockBalance = await getBalance(await lock.getAddress())
      initialKeyOwnerBalance = await getBalance(await keyOwner.getAddress())
      estimatedRefund = await lock.getCancelAndRefundValue(tokenId)

      const tx = await lock.connect(keyOwner).cancelAndRefund(tokenId)

      // get event
      const receipt = await tx.wait()
      ;({
        event,
        args: { refund },
      } = await getEvent(receipt, 'CancelKey'))
      const lockBalance = await getBalance(await lock.getAddress())
      withdrawalAmount = lockBalance - initialLockBalance

      // estimate tx gas cost
      txFee = tx.gasPrice * receipt.gasUsed
    })

    it('should emit a CancelKey event', async () => {
      assert.equal(event.fragment.name, 'CancelKey')
    })

    it('the amount of refund should be greater than 0', async () => {
      assert(refund > 0)
    })

    it('the amount of refund should be less than or equal to the original key price', async () => {
      assert(refund < keyPrice)
    })

    it('the amount of refund should be less than or equal to the estimated refund', async () => {
      assert(refund <= estimatedRefund)
    })

    it('should make the key no longer valid (i.e expired)', async () => {
      const isValid = await lock.getHasValidKey(await keyOwner.getAddress())
      assert.equal(isValid, false)
    })

    it('should retain ownership info', async () => {
      assert.equal(await lock.ownerOf(tokenId), await keyOwner.getAddress())
    })

    it("should increase the owner's balance with the amount of funds withdrawn from the lock", async () => {
      const finalOwnerBalance = await getBalance(await keyOwner.getAddress())
      assert(
        finalOwnerBalance,
        initialKeyOwnerBalance + withdrawalAmount - txFee
      )
    })
  })

  describe('free keys', () => {
    before(async () => {
      lockFree = await deployLock({ name: 'FREE' })
    })
    it('the estimated refund for a free Key should be 0', async () => {
      const tx = await lockFree.grantKeys(
        [await receiver.getAddress()],
        [999999999999],
        [ADDRESS_ZERO]
      )
      const receipt = await tx.wait()
      const { args } = await getEvent(receipt, 'Transfer')
      const estimatedRefund = await lockFree.getCancelAndRefundValue(
        args.tokenId
      )
      assert.equal(estimatedRefund, 0)
    })

    it('can cancel a free key', async () => {
      const tx = await lockFree.grantKeys(
        [await receiver.getAddress()],
        [999999999999],
        [ADDRESS_ZERO]
      )
      const receipt = await tx.wait()
      const {
        args: { tokenId },
      } = await getEvent(receipt, 'Transfer')

      const txCancel = await lockFree.cancelAndRefund(tokenId)
      const cancelReceipt = await txCancel.wait()
      const {
        args: { tokenId: cancelledTokenId },
      } = await getEvent(cancelReceipt, 'CancelKey')
      assert.equal(cancelledTokenId, tokenId)
    })

    it('approved user can cancel a free key', async () => {
      const tx = await lockFree.grantKeys(
        [await receiver.getAddress()],
        [999999999999],
        [ADDRESS_ZERO]
      )

      const receipt = await tx.wait()
      const {
        args: { tokenId },
      } = await getEvent(receipt, 'Transfer')
      await lockFree
        .connect(receiver)
        .approve(await anotherKeyOwner.getAddress(), tokenId)
      const txCancel = await lockFree.connect(receiver).cancelAndRefund(tokenId)
      const cancelReceipt = await txCancel.wait()
      const { args: cancelArgs } = await getEvent(cancelReceipt, 'CancelKey')
      assert.equal(tokenId, cancelArgs.tokenId)
    })
  })

  describe('allows the Lock owner to specify a different cancellation penalty', () => {
    let tx

    before(async () => {
      lock = await deployLock()
      ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
      tx = await lock.updateRefundPenalty(0, 2000) // 20%
    })

    it('should trigger an event', async () => {
      const receipt = await tx.wait()
      const event = await getEvent(receipt, 'RefundPenaltyChanged')
      assert.equal(event.args.refundPenaltyBasisPoints, '2000')
    })

    it('should return the correct penalty', async () => {
      const numerator = await lock.refundPenaltyBasisPoints()
      assert.equal(numerator, '2000') // updated to 20%
    })

    it('should still allow refund', async () => {
      const tx = await lock.connect(keyOwner).cancelAndRefund(tokenId)
      const receipt = await tx.wait()
      const { args } = await getEvent(receipt, 'CancelKey')
      assert(args.refund > 0)
    })
  })

  describe('should fail when', () => {
    it('should fail if the Lock owner withdraws too much funds', async () => {
      await lock
        .connect(lockCreator)
        .withdraw(await lock.tokenAddress(), await lockCreator.getAddress(), 0)
      await reverts(
        lock.connect(anotherKeyOwner).cancelAndRefund(anotherTokenId),
        ''
      )
    })

    it('non-managers should fail to update the fee', async () => {
      await reverts(
        lock.connect(attacker).updateRefundPenalty(0, 0),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('the key is expired', async () => {
      const { tokenId } = await purchaseKey(lock, await keyOwner.getAddress())
      await lock.expireAndRefundFor(tokenId, 0)
      await reverts(lock.cancelAndRefund(tokenId), 'KEY_NOT_VALID')
    })

    it('the key does not exist', async () => {
      await reverts(lock.cancelAndRefund(132), 'NO_SUCH_KEY')
    })
  })
})
