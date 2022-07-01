const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const { deployLock, getBalance, purchaseKeys } = require('../helpers')

let tokenId

describe('Lock / freeTrial', (accounts) => {
  let lock
  const keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]
  const keyPrice = ethers.utils.parseUnits('0.01', 'ether')

  beforeEach(async () => {
    lock = await deployLock()
    const { tokenIds } = await purchaseKeys(lock, keyOwners.length)
    ;[tokenId] = tokenIds
  })

  it('No free trial by default', async () => {
    const freeTrialLength = new BigNumber(await lock.freeTrialLength())
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
        await lock.cancelAndRefund(tokenId, {
          from: keyOwners[0],
        })
      })

      it('should provide a full refund', async () => {
        const refundAmount = initialLockBalance.minus(
          await getBalance(lock.address)
        )
        assert.equal(refundAmount.toString(), keyPrice.toString())
      })
    })

    describe('should cancel and provide a partial refund after the trial expires', () => {
      beforeEach(async () => {
        await sleep(6000)
        await lock.cancelAndRefund(tokenId, {
          from: keyOwners[0],
        })
      })

      it('should provide less than a full refund', async () => {
        const refundAmount = initialLockBalance.minus(
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
