const { assert } = require('chai')
const { deployLock, purchaseKey, ADDRESS_ZERO } = require('../helpers')

contract('Lock / isValidKey', (accounts) => {
  let keyOwner = accounts[1]
  let lock
  let tokenId

  beforeEach(async () => {
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
    await lock.transferFrom(keyOwner, accounts[5], tokenId, {
      from: keyOwner,
    })
    assert.equal(await lock.isValidKey(tokenId), true)
  })

  it('should be false after expiring', async () => {
    await lock.expireAndRefundFor(tokenId, 0, {
      from: accounts[0],
    })
    assert.equal(await lock.isValidKey(tokenId), false)
  })

  it('should be false after cancelling', async () => {
    await lock.cancelAndRefund(tokenId, {
      from: keyOwner,
    })
    assert.equal(await lock.isValidKey(tokenId), false)
  })
})

contract('Lock / isKey', (accounts) => {
  let keyOwner = accounts[1]
  let lock

  beforeEach(async () => {
    lock = await deployLock()
    await lock.updateTransferFee(0) // disable the transfer fee for this test
    const tx = await lock.grantKeys([keyOwner.address], [0], [ADDRESS_ZERO])
    const { tokenId } = tx.logs[0].args

    // make sure `setKeyManagerOf` doesnt revert, as it uses `isKey`
    await lock.setKeyManagerOf(tokenId, accounts[2])
    assert.equal(await lock.isKeyManager(tokenId, accounts[2]), true)
  })
})
