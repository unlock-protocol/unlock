const assert = require('assert')
const { ethers } = require('hardhat')
const { purchaseKey, reverts, deployLock } = require('../helpers')

describe('Lock / disableTransfers', () => {
  let lock
  let tokenId
  let keyOwner, accountWithNoKey
  const oneDay = 60 * 60 * 24

  before(async () => {
    ;[, keyOwner, accountWithNoKey] = await ethers.getSigners()
    lock = await deployLock()
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))

    // Change the fee to 100%
    await lock.updateTransferFee(10000)
  })

  describe('setting fee to 100%', () => {
    describe('disabling transferFrom', () => {
      it('should prevent key transfers by reverting', async () => {
        // check owner has a key
        assert.equal(
          await lock.getHasValidKey(await keyOwner.getAddress()),
          true
        )
        // try to transfer it
        await reverts(
          lock
            .connect(keyOwner)
            .transferFrom(
              await keyOwner.getAddress(),
              await accountWithNoKey.getAddress(),
              tokenId
            ),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(
          await lock.getHasValidKey(await keyOwner.getAddress()),
          true
        )
        // check recipient never received a key
        assert.equal(
          await lock
            .connect(accountWithNoKey)
            .keyExpirationTimestampFor(await accountWithNoKey.getAddress()),
          0
        )
      })
    })

    describe('disabling shareKey', () => {
      it('should prevent key sharing by reverting', async () => {
        // check owner has a key
        assert.equal(
          await lock.getHasValidKey(await keyOwner.getAddress()),
          true
        )
        // try to share it
        await reverts(
          lock
            .connect(keyOwner)
            .shareKey(await accountWithNoKey.getAddress(), tokenId, oneDay),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(
          await lock.getHasValidKey(await keyOwner.getAddress()),
          true
        )
        // check recipient never received a key
        assert.equal(
          await lock.keyExpirationTimestampFor(
            await accountWithNoKey.getAddress()
          ),
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
      assert.equal(await lock.getHasValidKey(await keyOwner.getAddress()), true)
      assert.equal(
        await lock.getHasValidKey(await accountWithNoKey.getAddress()),
        false
      )
      // attempt a transfer
      await lock
        .connect(keyOwner)
        .transferFrom(
          await keyOwner.getAddress(),
          await accountWithNoKey.getAddress(),
          tokenId
        )
      // check that recipient received a key
      assert.equal(
        await lock.getHasValidKey(await accountWithNoKey.getAddress()),
        true
      )
    })
  })
})
