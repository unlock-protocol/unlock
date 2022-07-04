const { ethers } = require('hardhat')
const { deployLock, getBalance, purchaseKeys } = require('../helpers')
const { assert } = require('chai')

describe('Lock / freeTrial', () => {
  let tokenId
  let lock
  let keyOwners
  const keyPrice = ethers.utils.parseUnits('0.01', 'ether')

  beforeEach(async () => {
    lock = await deployLock()
    const signers = await ethers.getSigners()
    keyOwners = signers.slice(1, 4)

    const { tokenIds } = await purchaseKeys(lock, keyOwners.length)
    ;[tokenId] = tokenIds
  })

  it('No free trial by default', async () => {
    const freeTrialLength = await lock.freeTrialLength()
    assert.equal(freeTrialLength.toNumber(), 0)
  })

  describe('with a free trial defined', () => {
    let initialLockBalance

    beforeEach(async () => {
      await lock.updateRefundPenalty(5, 2000)
      initialLockBalance = await getBalance(lock.address)
    })

    describe('should cancel and provide a full refund when enough time remains', () => {
      beforeEach(async () => {
        await lock.connect(keyOwners[0]).cancelAndRefund(tokenId)
      })

      it('should provide a full refund', async () => {
        const refundAmount = initialLockBalance.sub(
          await getBalance(lock.address)
        )
        assert.equal(refundAmount.toString(), keyPrice.toString())
      })
    })

    describe('should cancel and provide a partial refund after the trial expires', () => {
      beforeEach(async () => {
        await sleep(6000)
        await lock.connect(keyOwners[0]).cancelAndRefund(tokenId)
      })

      it('should provide less than a full refund', async () => {
        const refundAmount = initialLockBalance.sub(
          await getBalance(lock.address)
        )
        assert.notEqual(refundAmount.toString(), keyPrice.toString())
        assert(refundAmount.lt(keyPrice.toString()))
      })
    })
  })
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
