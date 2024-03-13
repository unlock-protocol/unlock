const { assert } = require('chai')
const { ethers } = require('hardhat')
const {
  deployLock,
  reverts,
  purchaseKey,
  compareBigNumbers,
  increaseTimeTo,
} = require('../helpers')

describe('Lock / transferFee', () => {
  let lock
  let keyOwner, newOwner, randomSigner, lockManager
  const denominator = 10000
  let tokenId

  // TODO test using an ERC20 priced lock as well
  before(async () => {
    lock = await deployLock({ isEthers: true })
    ;[, keyOwner, newOwner, randomSigner, lockManager] =
      await ethers.getSigners()
    ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
  })

  it('has a default fee of 0%', async () => {
    const feeNumerator = await lock.transferFeeBasisPoints()
    compareBigNumbers(feeNumerator.div(denominator), '0')
  })

  it('reverts if a non-manager attempts to change the fee', async () => {
    await reverts(
      lock.connect(randomSigner).updateTransferFee(0),
      'ONLY_LOCK_MANAGER'
    )
  })

  describe('once a fee of 5% is set', () => {
    let fee
    let fee1
    let fee2
    let fee3

    before(async () => {
      // Change the fee to 5%
      await lock.updateTransferFee(500)
    })

    it('estimates the transfer fee, which is 5% of remaining duration or less', async () => {
      const { timestamp: nowBefore } = await ethers.provider.getBlock('latest')
      fee = await lock.getTransferFee(tokenId, 0)
      // Mine a transaction in order to ensure the block.timestamp has updated
      await purchaseKey(lock, randomSigner.address)

      const { timestamp: nowAfter } = await ethers.provider.getBlock('latest')
      let expiration = await lock.keyExpirationTimestampFor(tokenId)

      // Fee is <= the expected fee before the call
      assert(fee.lte(expiration.sub(nowBefore).mul(5).div(100)))

      // and >= the expected fee after the call
      assert(fee.gte(expiration.sub(nowAfter).mul(5).div(100)))
    })

    it('calculates the fee based on the time value passed in', async () => {
      fee1 = await lock.getTransferFee(tokenId, 100)
      fee2 = await lock.getTransferFee(tokenId, 60 * 60 * 24 * 365)
      fee3 = await lock.getTransferFee(tokenId, 60 * 60 * 24 * 30)
      assert.equal(fee1, 5)
      assert.equal(fee2, 1576800)
      assert.equal(fee3, 129600)
    })

    it('should revert if called for a non-existing key', async () => {
      await reverts(lock.getTransferFee(19, 0), 'NO_SUCH_KEY')
    })

    describe('when the key is transferred', () => {
      let expirationBefore
      let expirationAfter
      let fee

      before(async () => {
        expirationBefore = await lock.keyExpirationTimestampFor(tokenId)

        fee = await lock.getTransferFee(tokenId, 0)
        await lock
          .connect(keyOwner)
          .transferFrom(keyOwner.address, newOwner.address, tokenId)
        expirationAfter = await lock.keyExpirationTimestampFor(tokenId)
      })

      it('the fee is deducted from the time transferred', async () => {
        // make sure that a fee was taken
        // fee may be over-estimated (but not under-estimated)
        assert(expirationAfter.gte(expirationBefore.sub(fee)))
        // if less than 5 seconds have passed than the delta should be <= 1
        assert(expirationAfter.lte(expirationBefore.sub(fee).add(1)))
      })

      after(async () => {
        // Reset owners
        await lock
          .connect(newOwner)
          .transferFrom(newOwner.address, keyOwner.address, tokenId)
      })
    })

    describe('when the key is expired', () => {
      let fee
      before(async () => {
        const expirationBefore = await lock.keyExpirationTimestampFor(tokenId)
        await increaseTimeTo(expirationBefore)
        fee = await lock.getTransferFee(tokenId, 0)
      })

      it('the fee should be null', async () => {
        assert.equal(fee, 0)
      })
    })

    describe('the lock owner can change the fee', () => {
      let events

      before(async () => {
        // Change the fee to 0.25%
        const tx = await lock.updateTransferFee(25)
        ;({ events } = await tx.wait())
      })

      it('has an updated fee', async () => {
        const feeNumerator = await lock.transferFeeBasisPoints()
        compareBigNumbers(feeNumerator, '25')
      })

      it('emits TransferFeeChanged event', async () => {
        const { args } = events.find(
          ({ event }) => event === 'TransferFeeChanged'
        )
        assert.equal(args.transferFeeBasisPoints.toString(), '25')
      })
    })

    describe('should fail if', () => {
      it('called by an account which does not own the lock', async () => {
        await reverts(lock.connect(randomSigner).updateTransferFee(1000))
      })
    })
  })

  describe('when the key is transferred by a lock manager', () => {
    before(async () => {
      // Change the fee to 0.25%
      await lock.updateTransferFee(25)
      await lock.addLockManager(lockManager.address)
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    })

    it('is correctly set', async () => {
      assert.equal(await lock.isLockManager(lockManager.address), true)
      assert.equal(await lock.transferFeeBasisPoints(), 25)
    })

    it('does not pay the fee when transferring', async () => {
      assert.equal(await lock.ownerOf(tokenId), keyOwner.address)
      const expirationBefore = await lock.keyExpirationTimestampFor(tokenId)

      await lock
        .connect(lockManager)
        .transferFrom(keyOwner.address, newOwner.address, tokenId)

      // make sure the transfer happened correctly
      assert.equal(await lock.ownerOf(tokenId), newOwner.address)

      // balance stay unchanged
      compareBigNumbers(
        expirationBefore,
        await lock.keyExpirationTimestampFor(tokenId)
      )
    })
  })
})
