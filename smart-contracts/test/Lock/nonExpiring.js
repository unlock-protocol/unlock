const { assert } = require('chai')
const { time } = require('@openzeppelin/test-helpers')
const { ethers } = require('hardhat')

const {
  deployLock,
  purchaseKey,
  getBalanceEthers,
  MAX_UINT,
} = require('../helpers')

const FIVE_HUNDRED_YEARS = 5 * 100 * 365 * 24 * 60 * 60 * 1000

contract('Lock / non expiring', () => {
  let lock
  let keyOwner
  let keyPrice
  let tokenId

  beforeEach(async () => {
    ;[, keyOwner] = await ethers.getSigners()
    lock = await deployLock({ name: 'NON_EXPIRING', isEthers: true })
    keyPrice = await lock.keyPrice()
    ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
  })

  describe('Create lock', () => {
    it('should set the expiration date to MAX_UINT', async () => {
      assert.equal((await lock.expirationDuration()).toString(), MAX_UINT)
    })
  })

  describe('Purchased key', () => {
    it('should have an expiration timestamp of as max uint', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.balanceOf(keyOwner.address), 1)
      assert.equal(
        (await lock.keyExpirationTimestampFor(tokenId)).toString(),
        MAX_UINT
      )
    })

    it('should be valid far in the future', async () => {
      await time.increaseTo(Date.now() + FIVE_HUNDRED_YEARS)
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.balanceOf(keyOwner.address), 1)
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
        await time.increaseTo(Date.now() + FIVE_HUNDRED_YEARS)
        assert.equal(
          (await lock.getCancelAndRefundValue(tokenId)).toString(),
          keyPrice.toString()
        )
      })
    })
    describe('cancelAndRefund', () => {
      it('should transfer entire price back', async () => {
        // make sure the refund actually happened
        const initialLockBalance = await getBalanceEthers(lock.address)
        const initialKeyOwnerBalance = await getBalanceEthers(keyOwner.address)

        // refund
        const tx = await lock.connect(keyOwner).cancelAndRefund(tokenId)

        // make sure key is cancelled
        assert.equal(await lock.isValidKey(tokenId), false)
        assert.equal(await lock.balanceOf(keyOwner.address), 0)

        const { events, gasUsed } = await tx.wait()

        // mkae sure event has been fired properly
        const {
          args: { refund },
        } = events.find(({ event }) => event === 'CancelKey')
        assert(refund.eq(keyPrice))

        // get gas used
        const txFee = tx.gasPrice.mul(gasUsed)

        // check key owner balance
        const finalOwnerBalance = await getBalanceEthers(keyOwner.address)

        assert(
          finalOwnerBalance.toString(),
          initialKeyOwnerBalance.add(refund).sub(txFee).toString()
        )

        // also check lock balance
        const finalLockBalance = await getBalanceEthers(lock.address)

        assert(
          finalLockBalance.toString(),
          initialLockBalance.sub(refund).toString()
        )
      })
    })
  })

  describe('Transfer', () => {
    it('should transfer a valid non-expiring key to someone else', async () => {
      const [, , keyReceiver] = await ethers.getSigners()
      await lock
        .connect(keyOwner)
        .transferFrom(keyOwner.address, keyReceiver.address, tokenId)

      assert.equal(await lock.getHasValidKey(keyOwner.address), false)
      assert.equal(await lock.getHasValidKey(keyReceiver.address), true)

      assert.equal(
        (await lock.keyExpirationTimestampFor(tokenId)).toString(),
        MAX_UINT
      )
    })
  })
})
