const { ethers } = require('hardhat')
const { assert } = require('chai')
const { deployLock, purchaseKey, ADDRESS_ZERO } = require('../helpers')

let keyOwner, rando
describe('Lock / isValidKey', () => {
  let lock
  let tokenId

  beforeEach(async () => {
    ;[, keyOwner, rando] = await ethers.getSigners()
    lock = await deployLock()
    await lock.updateTransferFee(0) // disable the transfer fee for this test
    ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
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
      .transferFrom(keyOwner.address, rando.address, tokenId)
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

describe('Lock / isKey', () => {
  let lock

  beforeEach(async () => {
    ;[, keyOwner, rando] = await ethers.getSigners()
    lock = await deployLock()
    await lock.updateTransferFee(0) // disable the transfer fee for this test
    const tx = await lock.grantKeys([keyOwner.address], [0], [ADDRESS_ZERO])
    const { tokenId } = tx.logs[0].args

    // make sure `setKeyManagerOf` doesnt revert, as it uses `isKey`
    await lock.setKeyManagerOf(tokenId, rando.address)
    assert.equal(await lock.isKeyManager(tokenId, rando.address), true)
  })
})
