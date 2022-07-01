const { assert } = require('chai')
const { ethers } = require('hardhat')
const { purchaseKey, reverts, deployLock } = require('../helpers')

describe('Lock / disableTransfers', () => {
  let lock
  let tokenId
  let keyOwner, accountWithNoKey, anotherAccount
  const oneDay = ethers.BigNumber.from(60 * 60 * 24)

  before(async () => {
    ;[, keyOwner, accountWithNoKey, anotherAccount] = await ethers.getSigners()
    lock = await deployLock()
    ;({ tokenId } = await purchaseKey(lock, keyOwner))

    // Change the fee to 100%
    await lock.updateTransferFee(10000)
  })

  describe('setting fee to 100%', () => {
    describe('disabling transferFrom', () => {
      it('should prevent key transfers by reverting', async () => {
        // check owner has a key
        assert.equal(await lock.getHasValidKey(keyOwner.address), true)
        // try to transfer it
        await reverts(
          lock
            .connect(keyOwner)
            .transferFrom(keyOwner.address, accountWithNoKey.address, tokenId),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(await lock.getHasValidKey(keyOwner.address), true)
        // check recipient never received a key
        assert.equal(
          await lock
            .connect(accountWithNoKey)
            .keyExpirationTimestampFor(accountWithNoKey.address),
          0
        )
      })
    })

    describe('disabling setApprovalForAll', () => {
      it('should prevent user from setting setApprovalForAll', async () => {
        await reverts(
          lock
            .connect(keyOwner)
            .setApprovalForAll(anotherAccount.address, true),
          'KEY_TRANSFERS_DISABLED'
        )
      })
    })

    describe('disabling shareKey', () => {
      it('should prevent key sharing by reverting', async () => {
        // check owner has a key
        assert.equal(await lock.getHasValidKey(keyOwner.address), true)
        // try to share it
        await reverts(
          lock
            .connect(keyOwner)
            .shareKey(accountWithNoKey.address, tokenId, oneDay),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(await lock.getHasValidKey(keyOwner.address), true)
        // check recipient never received a key
        assert.equal(
          await lock
            .connect(accountWithNoKey)
            .keyExpirationTimestampFor(accountWithNoKey.address),
          0
        )
      })
    })
  })

  describe('Re-enabling transfers', () => {
    it('lock owner should be able to allow transfers by lowering fee', async () => {
      // Change the fee to 99%
      await lock.updateTransferFee(1000)
      // check owner has a key
      assert.equal(await lock.getHasValidKey(keyOwner.address), true)
      assert.equal(await lock.getHasValidKey(accountWithNoKey.address), false)
      // attempt a transfer
      await lock
        .connect(keyOwner)
        .transferFrom(keyOwner.address, accountWithNoKey.address, tokenId)
      // check that recipient received a key
      assert.equal(await lock.getHasValidKey(accountWithNoKey.address), true)
    })
  })
})
