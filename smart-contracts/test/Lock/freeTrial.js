const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployLock,
  getBalance,
  purchaseKey,
  compareBigNumbers,
} = require('../helpers')

const keyPrice = ethers.parseUnits('0.01', 'ether')

describe('Lock / freeTrial', () => {
  let lock
  let tokenId
  let keyOwner

  beforeEach(async () => {
    lock = await deployLock()
    ;[keyOwner] = await ethers.getSigners()
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
  })

  it('No free trial by default', async () => {
    compareBigNumbers(await lock.freeTrialLength(), 0)
  })

  describe('with a free trial defined', () => {
    let initialLockBalance

    beforeEach(async () => {
      await lock.updateRefundPenalty(5, 2000)
      initialLockBalance = await getBalance(await lock.getAddress())
    })

    describe('should cancel and provide a full refund when enough time remains', () => {
      beforeEach(async () => {
        await lock.connect(keyOwner).cancelAndRefund(tokenId)
      })

      it('should provide a full refund', async () => {
        const refundAmount =
          initialLockBalance - (await getBalance(await lock.getAddress()))
        compareBigNumbers(refundAmount, keyPrice)
      })
    })

    describe('should cancel and provide a partial refund after the trial expires', () => {
      beforeEach(async () => {
        await sleep(6000)
        await lock.connect(keyOwner).cancelAndRefund(tokenId)
      })

      it('should provide less than a full refund', async () => {
        const refundAmount =
          initialLockBalance - (await getBalance(await lock.getAddress()))
        assert.notEqual(refundAmount, keyPrice)
        assert(refundAmount < keyPrice)
      })
    })
  })
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
