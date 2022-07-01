const { reverts } = require('../helpers/errors')
const { ADDRESS_ZERO, purchaseKey, deployLock } = require('../helpers')
const { assert } = require('chai')
const { ethers } = require('hardhat')

describe('Lock / burn', () => {
  let keyOwner
  let someAccount
  let lock
  let tokenId

  before(async () => {
    lock = await deployLock()
    lock.setMaxKeysPerAddress(10)
    ;[, keyOwner, someAccount] = await ethers.getSigners()
  })

  beforeEach(async () => {
    ;({ tokenId } = await purchaseKey(lock, keyOwner))
  })

  it('should delete ownership record', async () => {
    assert.equal(await lock.getHasValidKey(keyOwner.address), true)
    assert.equal(await lock.ownerOf(tokenId), keyOwner.address)
    await lock.connect(keyOwner).burn(tokenId)
    assert.equal(await lock.getHasValidKey(keyOwner.address), false)
    assert.equal(await lock.ownerOf(tokenId), ADDRESS_ZERO)
  })

  it('emit a transfer event', async () => {
    const tx = await lock.connect(keyOwner).burn(tokenId)
    const { events } = await tx.wait()
    const { args } = events.find((v) => v.event === 'Transfer')
    assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
    assert.equal(args.to, ADDRESS_ZERO)
    assert.equal(args.from, keyOwner.address)
  })

  it('allow key manager to burn a key', async () => {
    await lock.connect(keyOwner).setKeyManagerOf(tokenId, someAccount.address)
    assert.equal(await lock.getHasValidKey(keyOwner.address), true)
    assert.equal(await lock.ownerOf(tokenId), keyOwner.address)
    await lock.connect(someAccount).burn(tokenId)
    assert.equal(await lock.getHasValidKey(keyOwner.address), false)
    assert.equal(await lock.ownerOf(tokenId), ADDRESS_ZERO)
  })

  it('should work only on existing keys', async () => {
    await reverts(lock.burn(123), 'NO_SUCH_KEY')
  })

  it('should be callable only by owner', async () => {
    await reverts(
      lock.connect(someAccount).burn(tokenId),
      'ONLY_KEY_MANAGER_OR_APPROVED'
    )
  })
})
