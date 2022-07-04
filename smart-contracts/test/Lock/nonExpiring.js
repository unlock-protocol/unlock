const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  deployLock,
  purchaseKey,
  getBalance,
  increaseTimeTo,
  MAX_UINT,
} = require('../helpers')

// in seconds
const FIVE_HUNDRED_YEARS = 5 * 100 * 365 * 24 * 60 * 60 * 1000

describe('Lock / non expiring', () => {
  let lock
  let tokenId
  let keyPrice
  let keyOwner, keyReceiver

  before(async () => {
    lock = await deployLock({ name: 'NON_EXPIRING' })
    ;[, keyOwner, keyReceiver] = await ethers.getSigners()
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
    keyPrice = await lock.keyPrice()
    await lock.setMaxKeysPerAddress(10)
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
      const { timestamp } = await ethers.provider.getBlock()
      await increaseTimeTo(timestamp + FIVE_HUNDRED_YEARS)
      assert.equal(await lock.isValidKey(tokenId), true)
      assert.equal(await lock.balanceOf(keyOwner.address), 1)
    })
  })

  describe('Refund', () => {
    before(async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
    })
    describe('getCancelAndRefundValue', () => {
      it('should refund entire price, regardless of time passed since purchase', async () => {
        // check the refund value
        assert.equal(
          (await lock.getCancelAndRefundValue(tokenId)).toString(),
          keyPrice.toString()
        )
        const { timestamp } = await ethers.provider.getBlock()
        await increaseTimeTo(timestamp + FIVE_HUNDRED_YEARS)
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
        const balanceBefore = await lock.balanceOf(keyOwner.address)
        const tx = await lock.connect(keyOwner).cancelAndRefund(tokenId)
        const { events, gasUsed, transactionHash } = await tx.wait()

        const { args } = events.find(({ event }) => event === 'CancelKey')
        const { refund } = args

        // make sure key is cancelled
        assert.equal(await lock.isValidKey(tokenId), false)
        assert.equal(
          balanceBefore.sub(await lock.balanceOf(keyOwner.address)).toNumber(),
          1
        )
        assert(refund.eq(keyPrice))

        // get gas used
        const { gasPrice } = await ethers.provider.getTransaction(
          transactionHash
        )
        const txFee = gasPrice.mul(gasUsed)

        // check key owner balance
        const finalOwnerBalance = await getBalance(keyOwner)

        assert(
          finalOwnerBalance.toString(),
          initialKeyOwnerBalance.add(refund).sub(txFee).toString()
        )

        // also check lock balance
        const finalLockBalance = await getBalance(lock.address)

        assert(
          finalLockBalance.toString(),
          initialLockBalance.sub(refund).toString()
        )
      })
    })
  })

  describe('Transfer', () => {
    it('should transfer a valid non-expiring key to someone else', async () => {
      ;({ tokenId } = await purchaseKey(lock, keyOwner))
      await lock
        .connect(keyOwner)
        .transferFrom(keyOwner.address, keyReceiver.address, tokenId)
      assert.equal(await lock.ownerOf(tokenId), keyReceiver.address)

      assert.equal(
        (await lock.keyExpirationTimestampFor(tokenId)).toString(),
        MAX_UINT
      )
    })
  })
})
