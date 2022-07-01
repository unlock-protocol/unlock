const { ethers } = require('hardhat')
const { assert } = require('chai')
const {
  ADDRESS_ZERO,
  deployLock,
  deployERC20,
  getBalance,
  purchaseKey,
  purchaseKeys,
  reverts,
} = require('../helpers')

let tokenIds

describe('Lock / cancelAndRefund', () => {
  let lock
  let lockFree
  let keyOwners
  let approvedUser
  const keyPrice = ethers.utils.parseEther('0.01')

  before(async () => {
    const [, ...signers] = await ethers.getSigners()
    keyOwners = signers.slice(1, 7)
    approvedUser = signers[9]
    lock = await deployLock()
    lockFree = await deployLock({ name: 'FREE' })
    await lock.setMaxKeysPerAddress(10)
    ;({ tokenIds } = await purchaseKeys(lock, keyOwners.length))
  })

  it('should return the correct penalty', async () => {
    const basisPoint = await lock.refundPenaltyBasisPoints()
    assert.equal(basisPoint.toNumber(), 1000) // default of 10%
  })

  it('the amount of refund should be less than the original keyPrice when purchased normally', async () => {
    const estimatedRefund = await lock.getCancelAndRefundValue(tokenIds[0])
    assert(estimatedRefund.lt(keyPrice))
  })

  it('the amount of refund should be less than the original keyPrice when expiration is very far in the future', async () => {
    const tx = await lock.grantKeys(
      [keyOwners[5].address],
      [999999999999],
      [ADDRESS_ZERO]
    )
    const { events } = await tx.wait()
    const { args } = events.find((v) => v.event === 'Transfer')
    const estimatedRefund = await lock.getCancelAndRefundValue(args.tokenId)
    assert(estimatedRefund.lt(keyPrice))
  })

  it('the estimated refund for a free Key should be 0', async () => {
    const tx = await lockFree.grantKeys(
      [keyOwners[5].address],
      [999999999999],
      [ADDRESS_ZERO]
    )
    const { events } = await tx.wait()
    const { args } = events.find((v) => v.event === 'Transfer')
    const estimatedRefund = await lockFree.getCancelAndRefundValue(args.tokenId)
    assert.equal(estimatedRefund.toNumber(), 0)
  })

  describe('should cancel and refund when enough time remains', () => {
    let initialLockBalance
    let initialKeyOwnerBalance
    let estimatedRefund
    let gasUsed
    let eventsObj
    let transactionHash
    let withdrawalAmount
    let tokenId

    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwners[0]))
      initialLockBalance = await getBalance(lock.address)
      initialKeyOwnerBalance = await getBalance(keyOwners[0].address)
      estimatedRefund = await lock.getCancelAndRefundValue(tokenId)

      const tx = await lock.connect(keyOwners[0]).cancelAndRefund(tokenId)
      ;({ events: eventsObj, transactionHash, gasUsed } = await tx.wait())
      withdrawalAmount = (await getBalance(lock.address)).sub(
        initialLockBalance
      )
    })

    it('should emit a CancelKey event', async () => {
      assert.equal(eventsObj[0].event, 'CancelKey')
    })

    it('the amount of refund should be greater than 0', async () => {
      const { refund } = eventsObj[0].args
      assert(refund.gt(0))
    })

    it('the amount of refund should be less than or equal to the original key price', async () => {
      const { refund } = eventsObj[0].args
      assert(refund.lt(keyPrice))
    })

    it('the amount of refund should be less than or equal to the estimated refund', async () => {
      const { refund } = eventsObj[0].args
      assert(refund.lte(estimatedRefund))
    })

    it('should make the key no longer valid (i.e. expired)', async () => {
      const isValid = await lock.isValidKey(tokenId)
      assert.equal(isValid, false)
    })

    it("should increase the owner's balance with the amount of funds withdrawn from the lock", async () => {
      const { gasPrice } = await ethers.provider.getTransaction(transactionHash)
      const txFee = gasPrice.mul(gasUsed)
      const finalOwnerBalance = await getBalance(keyOwners[0].address)
      assert(
        finalOwnerBalance.toString(),
        initialKeyOwnerBalance.add(withdrawalAmount).sub(txFee).toString()
      )
    })
  })

  it('can cancel a free key', async () => {
    const tx = await lockFree.grantKeys(
      [keyOwners[0].address],
      [999999999999],
      [ADDRESS_ZERO]
    )
    const { events } = await tx.wait()
    const { args } = events.find((v) => v.event === 'Transfer')

    const txObj = await lockFree
      .connect(keyOwners[0])
      .cancelAndRefund(args.tokenId)
    const { events: eventsObj } = await txObj.wait()

    assert.equal(eventsObj[0].event, 'CancelKey')
  })

  it('approved user can cancel a key', async () => {
    const tx = await lockFree.grantKeys(
      [keyOwners[1].address],
      [999999999999],
      [ADDRESS_ZERO]
    )
    const { events } = await tx.wait()
    const { args } = events.find((v) => v.event === 'Transfer')
    await lockFree
      .connect(keyOwners[1])
      .approve(approvedUser.address, args.tokenId)

    const txObj = await lockFree
      .connect(approvedUser)
      .cancelAndRefund(args.tokenId)
    const { events: eventsObj } = await txObj.wait()

    assert.equal(eventsObj[0].event, 'CancelKey')
  })

  describe('allows the Lock owner to specify a different cancellation penalty', () => {
    let events

    before(async () => {
      const tx = await lock.updateRefundPenalty(0, 2000) // 20%
      ;({ events } = await tx.wait())
    })

    it('should trigger an event', async () => {
      const event = events.find((log) => {
        return log.event === 'RefundPenaltyChanged'
      })
      assert.equal(event.args.refundPenaltyBasisPoints.toNumber(), 2000)
    })

    it('should return the correct penalty', async () => {
      const numerator = await lock.refundPenaltyBasisPoints()
      assert.equal(numerator, 2000) // updated to 20%
    })

    it('should still allow refund', async () => {
      const { tokenId } = await purchaseKey(lock, keyOwners[4])
      const txObj = await lock.connect(keyOwners[4]).cancelAndRefund(tokenId)
      const { events: eventsObj } = await txObj.wait()
      const { refund } = eventsObj[0].args
      assert(refund.gt(0))
    })
  })

  describe('should fail when', () => {
    it('should fail if the Lock owner withdraws too much funds', async () => {
      await lock.withdraw(await lock.tokenAddress(), 0)
      await reverts(lock.connect(keyOwners[3]).cancelAndRefund(tokenIds[3]), '')
    })

    it('non-managers should fail to update the fee', async () => {
      await reverts(
        lock.connect(keyOwners[1]).updateRefundPenalty(0, 0),
        'ONLY_LOCK_MANAGER'
      )
    })

    it('the key is expired', async () => {
      await lock.expireAndRefundFor(tokenIds[3], 0)
      await reverts(
        lock.connect(keyOwners[3]).cancelAndRefund(tokenIds[3]),
        'KEY_NOT_VALID'
      )
    })

    it('the key does not exist', async () => {
      await reverts(
        lock.connect(keyOwners[4]).cancelAndRefund(132),
        'NO_SUCH_KEY'
      )
    })
  })

  it('should refund in the new token after token address is changed', async () => {
    // deploy erc20
    const [daiOwner] = await ethers.getSigners()
    const token = await deployERC20()
    await token.mint(daiOwner.address, 100)

    const { tokenId } = await purchaseKey(lock, keyOwners[4])
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
    await lock.connect(keyOwners[4]).cancelAndRefund(tokenId)
    // check user's token balance
    assert((await token.balanceOf(keyOwners[4].address)).gt(0))

    //revert price back
    await lock.updateKeyPricing(keyPrice, ADDRESS_ZERO)
  })
})
