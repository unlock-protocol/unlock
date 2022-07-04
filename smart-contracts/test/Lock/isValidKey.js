const { ethers } = require('hardhat')
const { assert } = require('chai')
const { deployLock, purchaseKey } = require('../helpers')

describe('Lock / isValidKey', () => {
  let lock
  let tokenId
  let keyOwner
  let anotherAccount

  beforeEach(async () => {
    ;[, keyOwner, anotherAccount] = await ethers.getSigners()
    lock = await deployLock()
    await lock.updateTransferFee(0) // disable the transfer fee for this test
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
  })

  it('should be false if the key does not exist', async () => {
    assert.equal(await lock.isValidKey(123), false)
  })

  it('should be true after purchase', async () => {
    assert.equal(await lock.isValidKey(tokenId), true)
  })

  it('should still be true after transfering', async () => {
    await lock
      .connect(keyOwner)
      .transferFrom(keyOwner.address, anotherAccount.address, tokenId)
    assert.equal(await lock.isValidKey(tokenId), true)
  })

  it('should be false after expiring', async () => {
    await lock.expireAndRefundFor(tokenId, 0)
    assert.equal(await lock.isValidKey(tokenId), false)
  })

  it('should be false after cancelling', async () => {
    await lock.connect(keyOwner).cancelAndRefund(tokenId)
    assert.equal(await lock.isValidKey(tokenId), false)
  })
})
