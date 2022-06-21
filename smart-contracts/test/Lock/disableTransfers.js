const BigNumber = require('bignumber.js')
const { purchaseKey, reverts, deployLock } = require('../helpers')

let locks

contract('Lock / disableTransfers', (accounts) => {
  before(async () => {
    lock = await deployLock()
  })

  let lock
  let tokenId
  const keyOwner = accounts[1]
  const accountWithNoKey = accounts[2]
  const oneDay = new BigNumber(60 * 60 * 24)

  before(async () => {
    lock = locks.FIRST
    ;({ tokenId } = await purchaseKey(lock, keyOwner))

    // Change the fee to 100%
    await lock.updateTransferFee(10000)
  })

  describe('setting fee to 100%', () => {
    describe('disabling transferFrom', () => {
      it('should prevent key transfers by reverting', async () => {
        // check owner has a key
        assert.equal(await lock.getHasValidKey(keyOwner), true)
        // try to transfer it
        await reverts(
          lock.transferFrom(keyOwner, accountWithNoKey, tokenId, {
            from: keyOwner,
          }),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(await lock.getHasValidKey(keyOwner), true)
        // check recipient never received a key
        assert.equal(
          await lock.keyExpirationTimestampFor(accountWithNoKey, {
            from: accountWithNoKey,
          }),
          0
        )
      })
    })

    describe('disabling setApprovalForAll', () => {
      it('should prevent user from setting setApprovalForAll', async () => {
        await reverts(
          lock.setApprovalForAll(accounts[8], true, {
            from: keyOwner,
          }),
          'KEY_TRANSFERS_DISABLED'
        )
      })
    })

    describe('disabling shareKey', () => {
      it('should prevent key sharing by reverting', async () => {
        // check owner has a key
        assert.equal(await lock.getHasValidKey(keyOwner), true)
        // try to share it
        await reverts(
          lock.shareKey(accountWithNoKey, tokenId, oneDay, {
            from: keyOwner,
          }),
          'KEY_TRANSFERS_DISABLED'
        )
        // check owner still has a key
        assert.equal(await lock.getHasValidKey(keyOwner), true)
        // check recipient never received a key
        assert.equal(
          await lock.keyExpirationTimestampFor(accountWithNoKey, {
            from: accountWithNoKey,
          }),
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
      assert.equal(await lock.getHasValidKey(keyOwner), true)
      assert.equal(await lock.getHasValidKey(accountWithNoKey), false)
      // attempt a transfer
      await lock.transferFrom(keyOwner, accountWithNoKey, tokenId, {
        from: keyOwner,
      })
      // check that recipient received a key
      assert.equal(await lock.getHasValidKey(accountWithNoKey), true)
    })
  })
})
