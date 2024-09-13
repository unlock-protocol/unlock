const assert = require('assert')
const { increaseTimeTo } = require('../helpers')
const { ethers } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const { deployLock, purchaseKey, getBalance, MAX_UINT } = require('../helpers')

const FIVE_HUNDRED_YEARS = 5 * 100 * 365 * 24 * 60 * 60 * 1000

describe('Lock / non expiring', () => {
  let lock
  let keyOwner
  let keyPrice
  let tokenId

  beforeEach(async () => {
    ;[, keyOwner] = await ethers.getSigners()
    lock = await deployLock({ name: 'NON_EXPIRING', isEthers: true })
    keyPrice = await lock.keyPrice()
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
  })

  describe('Create lock', () => {
    it('should set the expiration date to MAX_UINT', async () => {
      assert.equal(await lock.expirationDuration(), MAX_UINT)
    })
  })

  describe('Purchased key', () => {
    it('should have an expiration timestamp of as max uint', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 1)
      assert.equal(await lock.keyExpirationTimestampFor(tokenId), MAX_UINT)
    })

    it('should be valid far in the future', async () => {
      await increaseTimeTo(Date.now() + FIVE_HUNDRED_YEARS)
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 1)
    })
  })

  describe('Refund', () => {
    describe('getCancelAndRefundValue', () => {
      it('should refund entire price, regardless of time passed since purchase', async () => {
        // check the refund value
        assert.equal(await lock.getCancelAndRefundValue(tokenId), keyPrice)
        await increaseTimeTo(Date.now() + FIVE_HUNDRED_YEARS)
        assert.equal(await lock.getCancelAndRefundValue(tokenId), keyPrice)
      })
    })
    describe('cancelAndRefund', () => {
      it('should transfer entire price back', async () => {
        // make sure the refund actually happened
        const initialLockBalance = await getBalance(await lock.getAddress())
        const initialKeyOwnerBalance = await getBalance(
          await keyOwner.getAddress()
        )

        // refund
        const tx = await lock.connect(keyOwner).cancelAndRefund(tokenId)

        // make sure key is cancelled
        assert.equal(await lock.isValidKey(tokenId), false)
        assert.equal(await lock.balanceOf(await keyOwner.getAddress()), 0)

        const receipt = await tx.wait()

        // mkae sure event has been fired properly
        const {
          args: { refund },
        } = await getEvent(receipt, 'CancelKey')
        assert(refund == keyPrice)

        // get gas used
        const txFee = tx.gasPrice * receipt.gasUsed

        // check key owner balance
        const finalOwnerBalance = await getBalance(await keyOwner.getAddress())

        assert(finalOwnerBalance, initialKeyOwnerBalance + refund - txFee)

        // also check lock balance
        const finalLockBalance = await getBalance(await lock.getAddress())

        assert.equal(finalLockBalance, initialLockBalance - refund)
      })
    })
  })

  describe('Transfer', () => {
    it('should transfer a valid non-expiring key to someone else', async () => {
      const [, , keyReceiver] = await ethers.getSigners()
      await lock
        .connect(keyOwner)
        .transferFrom(
          await keyOwner.getAddress(),
          await keyReceiver.getAddress(),
          tokenId
        )

      assert.equal(
        await lock.getHasValidKey(await keyOwner.getAddress()),
        false
      )
      assert.equal(
        await lock.getHasValidKey(await keyReceiver.getAddress()),
        true
      )

      assert.equal(await lock.keyExpirationTimestampFor(tokenId), MAX_UINT)
    })
  })
})
