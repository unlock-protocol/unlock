const { ethers } = require('hardhat')
const { assert } = require('chai')

const { reverts } = require('../helpers/errors')
const {
  ADDRESS_ZERO,
  purchaseKey,
  deployLock,
  compareBigNumbers,
} = require('../helpers')

describe('Lock / burn', () => {
  let keyOwner
  let lock
  let tokenId

  before(async () => {
    ;[, keyOwner] = await ethers.getSigners()
    lock = await deployLock()
  })

  beforeEach(async () => {
    ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
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
    compareBigNumbers(args.tokenId, tokenId)
    assert.equal(args.to, ADDRESS_ZERO)
    assert.equal(args.from, keyOwner.address)
  })

  it('allow key manager to burn a key', async () => {
    const [, , keyManager] = await ethers.getSigners()
    await lock.connect(keyOwner).setKeyManagerOf(tokenId, keyManager.address)
    assert.equal(await lock.getHasValidKey(keyOwner.address), true)
    assert.equal(await lock.ownerOf(tokenId), keyOwner.address)
    await lock.connect(keyManager).burn(tokenId)
    assert.equal(await lock.getHasValidKey(keyOwner.address), false)
    assert.equal(await lock.ownerOf(tokenId), ADDRESS_ZERO)
  })

  it('balance is updated correctly', async () => {
    compareBigNumbers(await lock.balanceOf(keyOwner.address), 1)
    compareBigNumbers(
      await lock.tokenOfOwnerByIndex(keyOwner.address, 0),
      tokenId.toNumber()
    )
    await lock.connect(keyOwner).burn(tokenId)
    compareBigNumbers(await lock.balanceOf(keyOwner.address), 0)
    await reverts(lock.tokenOfOwnerByIndex(keyOwner.address, 0), 'OUT_OF_RANGE')
  })

  it('totalSupply is decreased', async () => {
    const totalSupply = await lock.totalSupply()
    await lock.connect(keyOwner).burn(tokenId)
    compareBigNumbers(await lock.totalSupply(), totalSupply.sub(1))
  })

  it('should work only on existing keys', async () => {
    await reverts(lock.burn(123), 'NO_SUCH_KEY')
  })

  it('should be callable only by owner', async () => {
    const [, , random] = await ethers.getSigners()
    await reverts(
      lock.connect(random).burn(tokenId),
      'ONLY_KEY_MANAGER_OR_APPROVED'
    )
  })
})
