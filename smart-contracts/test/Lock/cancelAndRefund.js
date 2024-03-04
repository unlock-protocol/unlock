const { ethers } = require('hardhat')
const { assert } = require('chai')
const {
  ADDRESS_ZERO,
  deployLock,
  deployERC20,
  getBalance,
  purchaseKeys,
  reverts,
} = require('../helpers')

let token
let tokenIds

const BASIS_POINTS = ethers.BigNumber.from(`10000`)

describe('Lock / cancelAndRefund', (accounts) => {
  let lock
  let lockFree
  let lockCreator
  let keyOwners
  const keyPrice = ethers.utils.parseUnits('0.01', 'ether')

  before(async () => {
    let signers
    ;[lockCreator, ...signers] = await ethers.getSigners()
    keyOwners = signers.splice(0, 5)
    token = await deployERC20(lockCreator, true)
    await token.mint(lockCreator.address, 100)
    lock = await deployLock({ isEthers: true })
    ;({ tokenIds } = await purchaseKeys(lock, keyOwners.length))
  })

  describe('refunds', () => {
    it('should return the correct penalty', async () => {
      const numerator = await lock.refundPenaltyBasisPoints()
      assert.equal(BASIS_POINTS.div(numerator).toString(), '10') // default of 10%
    })

    it('the amount of refund should be less than the original keyPrice when purchased normally', async () => {
      const estimatedRefund = await lock.getCancelAndRefundValue(tokenIds[0])
      assert(estimatedRefund.lt(keyPrice.toString()))
    })

    it('the amount of refund should be less than the original keyPrice when expiration is very far in the future', async () => {
      const tx = await lock.grantKeys(
        [accounts[5]],
        [999999999999],
        [ADDRESS_ZERO]
      )
      const { events } = await tx.wait()
      const { args } = events.find((v) => v.event === 'Transfer')
      const estimatedRefund = await lock.getCancelAndRefundValue(args.tokenId)
      assert(estimatedRefund.lt(keyPrice.toString()))
    })

    it('should refund in the new token after token address is changed', async () => {
      console.log(keyOwners.length)

      // Confirm user has a key paid in eth
      assert.equal(await lock.getHasValidKey(keyOwners[4].address), true)
      assert.equal(await lock.tokenAddress(), 0)
      // check user's token balance
      assert.equal(await token.balanceOf(keyOwners[4].address), 0)
      // update token address and price
      await lock.updateKeyPricing(11, token.address)
      // fund lock with new erc20 tokens to deal enable refunds
      await token.mint(lock.address, 100)
      assert.equal(await token.balanceOf(lock.address), 100)
      // cancel and refund
      await lock.connect(keyOwners[4]).cancelAndRefund(tokenIds[4])
      // check user's token balance
      assert((await token.balanceOf(keyOwners[4].address)) > 0)
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
      initialLockBalance = await getBalance(lock.address)
      initialKeyOwnerBalance = await getBalance(keyOwners[0].address)
      estimatedRefund = await lock.getCancelAndRefundValue(tokenIds[0])

      const tx = await lock.connect(keyOwners[0]).cancelAndRefund(tokenIds[0])

      // get event
      const { events, gasUsed } = await tx.wait()
      ;({
        event,
        args: { refund },
      } = events.find(({ event }) => event === 'CancelKey'))
      const lockBalance = await getBalance(lock.address)
      withdrawalAmount = lockBalance.sub(initialLockBalance)

      // estimate tx gas cost
      txFee = tx.gasPrice.mul(gasUsed)
    })

    it('should emit a CancelKey event', async () => {
      assert.equal(event, 'CancelKey')
    })

    it('the amount of refund should be greater than 0', async () => {
      assert(refund.gt(0))
    })

    it('the amount of refund should be less than or equal to the original key price', async () => {
      assert(refund.lt(keyPrice.toString()))
    })

    it('the amount of refund should be less than or equal to the estimated refund', async () => {
      assert(refund.lte(estimatedRefund))
    })

    it('should make the key no longer valid (i.e. expired)', async () => {
      const isValid = await lock.getHasValidKey(keyOwners[0].address)
      assert.equal(isValid, false)
    })

    it('should retain ownership info', async () => {
      assert.equal(await lock.ownerOf(tokenIds[0]), keyOwners[0].address)
    })

    it("should increase the owner's balance with the amount of funds withdrawn from the lock", async () => {
      const finalOwnerBalance = await getBalance(keyOwners[0].address)
      assert(
        finalOwnerBalance.toString(),
        initialKeyOwnerBalance.add(withdrawalAmount).sub(txFee).toString()
      )
    })
  })

  describe('free keys', () => {
    before(async () => {
      lockFree = await deployLock({ name: 'FREE', isEthers: true })
    })
    it('the estimated refund for a free Key should be 0', async () => {
      const tx = await lockFree.grantKeys(
        [accounts[5]],
        [999999999999],
        [ADDRESS_ZERO],
        {
          from: accounts[0],
        }
      )
      const { events } = await tx.wait()
      const { args } = events.find((v) => v.event === 'Transfer')
      const estimatedRefund = await lockFree.getCancelAndRefundValue(
        args.tokenId
      )
      assert(estimatedRefund, 0)
    })

    it('can cancel a free key', async () => {
      const tx = await lockFree.grantKeys(
        [keyOwners[1].address],
        [999999999999],
        [ADDRESS_ZERO]
      )
      const { events } = await tx.wait()
      const {
        args: { tokenId },
      } = events.find((v) => v.event === 'Transfer')

      const txCancel = await lockFree.cancelAndRefund(tokenId)
      const { events: cancelEvents } = await txCancel.wait()
      const {
        args: { tokenId: cancelledTokenId },
      } = cancelEvents.find((v) => v.event === 'CancelKey')
      assert.equal(cancelledTokenId.toString(), tokenId.toString())
    })

    it('approved user can cancel a free key', async () => {
      const tx = await lockFree.grantKeys(
        [keyOwners[1].address],
        [999999999999],
        [ADDRESS_ZERO]
      )

      const { events } = await tx.wait()
      const {
        args: { tokenId },
      } = events.find((v) => v.event === 'Transfer')
      await lockFree
        .connect(keyOwners[1])
        .approve(keyOwners[4].address, tokenId)
      console.log('haha')
      const txCancel = await lockFree
        .connect(keyOwners[4])
        .cancelAndRefund(tokenId)
      const { events: cancelEvents } = await txCancel.wait()
      const { args: cancelArgs } = cancelEvents.find(
        (ev) => ev.event === 'CancelKey'
      )
      assert.equal(tokenId.toString(), cancelArgs.tokenId.toString())
    })
  })

  describe('allows the Lock owner to specify a different cancellation penalty', () => {
    let tx

    before(async () => {
      tx = await lock.updateRefundPenalty(0, 2000) // 20%
    })

    it('should trigger an event', async () => {
      const { events } = await tx.wait()
      const event = events.find((ev) => {
        return ev.event === 'RefundPenaltyChanged'
      })
      assert.equal(event.args.refundPenaltyBasisPoints.toString(), '2000')
    })

    it('should return the correct penalty', async () => {
      const numerator = await lock.refundPenaltyBasisPoints()
      assert.equal(numerator, '2000') // updated to 20%
    })

    it('should still allow refund', async () => {
      const tx = await lock.connect(keyOwners[2]).cancelAndRefund(tokenIds[2])
      const { events } = await tx.wait()
      const { args } = events.find((v) => v.event === 'CancelKey')
      assert(args.refund.gt(0))
    })
  })

  describe('should fail when', () => {
    it('should fail if the Lock owner withdraws too much funds', async () => {
      await lock
        .connect(lockCreator)
        .withdraw(await lock.tokenAddress(), lockCreator.address, 0)
      await reverts(lock.connect(keyOwners[1]).cancelAndRefund(tokenIds[3]), '')
    })

    it('non-managers should fail to update the fee', async () => {
      await reverts(
        lock.connect(keyOwners[3]).updateRefundPenalty(0, 0),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('the key is expired', async () => {
      await lock.connect(lockCreator).expireAndRefundFor(tokenIds[3], 0)
      await reverts(
        lock.connect(keyOwners[3]).cancelAndRefund(tokenIds[3]),
        'KEY_NOT_VALID'
      )
    })

    it('the key does not exist', async () => {
      await reverts(lock.cancelAndRefund(132), 'NO_SUCH_KEY')
    })
  })
})
