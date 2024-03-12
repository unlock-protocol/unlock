const { assert } = require('chai')
const { ethers } = require('hardhat')
const { deployLock, ADDRESS_ZERO, purchaseKey } = require('../../helpers')
let lock

describe('Lock / erc721 / ownerOf', () => {
  let keyOwner, anotherAccount
  before(async () => {
    ;[, keyOwner, anotherAccount] = await ethers.getSigners()
    lock = await deployLock()
  })

  it('should return 0x0 when key is nonexistent', async () => {
    let address = await lock.ownerOf(42)
    assert.equal(address, ADDRESS_ZERO)
  })

  it('should return the owner of the key', async () => {
    const { tokenId } = await purchaseKey(lock, keyOwner.address)
    let address = await lock.ownerOf(tokenId)
    assert.equal(address, keyOwner.address)
  })

  it('should work correctly after a transfer', async () => {
    const { tokenId } = await purchaseKey(lock, keyOwner.address)
    let address = await lock.ownerOf(tokenId)
    assert.equal(address, keyOwner.address)

    // transfer
    await lock
      .connect(keyOwner)
      .transferFrom(keyOwner.address, anotherAccount.address, tokenId)
    assert.equal(await lock.ownerOf(tokenId), anotherAccount.address)
  })
})
