const { assert } = require('chai')
const { time } = require('@openzeppelin/test-helpers')
const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')

const { deployLock, purchaseKey, getBalance, MAX_UINT } = require('../helpers')

contract('Lock / non expiring', (accounts) => {
  let lock
  const keyOwner = accounts[2]
  let keyPrice
  let tokenId

  beforeEach(async () => {
    lock = await deployLock({ name: 'NON_EXPIRING' })
    keyPrice = await lock.keyPrice()
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
  })

  describe('Create lock', () => {
    it('should set the expiration date to MAX_UINT', async () => {
      assert.equal((await lock.expirationDuration()).toString(), MAX_UINT)
    })
  })

  describe('Purchased key', () => {
    it('should have an expiration timestamp of as max uint', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.balanceOf(keyOwner), 1)
      assert.equal(
        (await lock.keyExpirationTimestampFor(tokenId)).toString(),
        MAX_UINT
      )
    })

    it('should be valid far in the future', async () => {
      const fiveHundredYears = 5 * 100 * 365 * 24 * 60 * 60 * 1000
      await time.increaseTo(Date.now() + fiveHundredYears)
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.balanceOf(keyOwner), 1)
    })
  })

  describe('Refund', () => {
    describe('getCancelAndRefundValue', () => {
      it('should refund entire price, regardless of time passed since purchase', async () => {
        // check the refund value
        assert.equal(
          (await lock.getCancelAndRefundValue(tokenId)).toString(),
          keyPrice.toString()
        )
        const fiveHundredYears = 5 * 100 * 365 * 24 * 60 * 60 * 1000
        await time.increaseTo(Date.now() + fiveHundredYears)
        assert.equal(
          (await lock.getCancelAndRefundValue(tokenId)).toString(),
          keyPrice.toString()
        )
      })
    })
    describe('cancelAndRefund', () => {
      it('should transfer entire price back', async () => {
        // make sure the refund actually happened
        const initialLockBalance = await getBalance(lock.address)
        const initialKeyOwnerBalance = await getBalance(keyOwner)

        // refund
        const tx = await lock.cancelAndRefund(tokenId, { from: keyOwner })

        // make sure key is cancelled
        assert.equal(await lock.isValidKey(tokenId), false)
        assert.equal(await lock.balanceOf(keyOwner), 0)
        assert.equal(tx.logs[0].event, 'CancelKey')
        const refund = new BigNumber(tx.logs[0].args.refund)
        assert(refund.isEqualTo(keyPrice))

        // get gas used
        const txHash = await ethers.provider.getTransaction(tx.tx)
        const gasUsed = new BigNumber(tx.receipt.gasUsed)
        const gasPrice = new BigNumber(txHash.gasPrice)
        const txFee = gasPrice.times(gasUsed)

        // check key owner balance
        const finalOwnerBalance = await getBalance(keyOwner)

        assert(
          finalOwnerBalance.toFixed(),
          initialKeyOwnerBalance.plus(refund).minus(txFee).toFixed()
        )

        // also check lock balance
        const finalLockBalance = await getBalance(lock.address)

        assert(
          finalLockBalance.toString(),
          initialLockBalance.minus(refund).toString()
        )
      })
    })
  })

  describe('Transfer', () => {
    it('should transfer a valid non-expiring key to someone else', async () => {
      const keyReceiver = accounts[3]
      await lock.transferFrom(keyOwner, keyReceiver, tokenId, {
        from: keyOwner,
      })

      assert.equal(await lock.getHasValidKey(keyOwner), false)
      assert.equal(await lock.getHasValidKey(keyReceiver), true)

      assert.equal(
        (await lock.keyExpirationTimestampFor(tokenId)).toString(),
        MAX_UINT
      )
    })
  })
})
