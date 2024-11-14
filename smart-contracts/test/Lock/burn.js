const { ethers } = require('hardhat')
const assert = require('assert')
const { reverts } = require('../helpers/errors')
const { getEvent, ADDRESS_ZERO } = require('@unlock-protocol/hardhat-helpers')
const { purchaseKey, deployLock, compareBigNumbers } = require('../helpers')

describe('Lock / burn', () => {
  let keyOwner
  let lock
  let tokenId

  before(async () => {
    ;[, keyOwner] = await ethers.getSigners()
    lock = await deployLock()
  })

  beforeEach(async () => {
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
  })

  it('should delete ownership record', async () => {
    assert.equal(await lock.getHasValidKey(await keyOwner.getAddress()), true)
    assert.equal(await lock.ownerOf(tokenId), await keyOwner.getAddress())
    await lock.connect(keyOwner).burn(tokenId)
    assert.equal(await lock.getHasValidKey(await keyOwner.getAddress()), false)
    assert.equal(await lock.ownerOf(tokenId), ADDRESS_ZERO)
  })

  it('emit a transfer event', async () => {
    const tx = await lock.connect(keyOwner).burn(tokenId)
    const receipt = await tx.wait()
    const { args } = await getEvent(receipt, 'Transfer')
    compareBigNumbers(args.tokenId, tokenId)
    assert.equal(args.to, ADDRESS_ZERO)
    assert.equal(args.from, await keyOwner.getAddress())
  })

  it('allow key manager to burn a key', async () => {
    const [, , keyManager] = await ethers.getSigners()
    await lock
      .connect(keyOwner)
      .setKeyManagerOf(tokenId, await keyManager.getAddress())
    assert.equal(await lock.getHasValidKey(await keyOwner.getAddress()), true)
    assert.equal(await lock.ownerOf(tokenId), await keyOwner.getAddress())
    await lock.connect(keyManager).burn(tokenId)
    assert.equal(await lock.getHasValidKey(await keyOwner.getAddress()), false)
    assert.equal(await lock.ownerOf(tokenId), ADDRESS_ZERO)
  })

  it('balance is updated correctly', async () => {
    compareBigNumbers(await lock.balanceOf(await keyOwner.getAddress()), 1)
    compareBigNumbers(
      await lock.tokenOfOwnerByIndex(await keyOwner.getAddress(), 0),
      tokenId
    )
    await lock.connect(keyOwner).burn(tokenId)
    compareBigNumbers(await lock.balanceOf(await keyOwner.getAddress()), 0)
    await reverts(
      lock.tokenOfOwnerByIndex(await keyOwner.getAddress(), 0),
      'OUT_OF_RANGE'
    )
  })

  it('totalSupply is decreased', async () => {
    const totalSupply = await lock.totalSupply()
    await lock.connect(keyOwner).burn(tokenId)
    compareBigNumbers(await lock.totalSupply(), totalSupply - 1n)
  })

  it('tokenId is not used twice', async () => {
    const { tokenId: tokenIdBeforeBurn } = await purchaseKey(
      lock,
      await keyOwner.getAddress()
    )
    const totalSupply = await lock.totalSupply()
    await lock.connect(keyOwner).burn(tokenIdBeforeBurn)
    compareBigNumbers(await lock.totalSupply(), totalSupply - 1n)
    const { tokenId: tokenIdAfterBurn } = await purchaseKey(
      lock,
      await keyOwner.getAddress()
    )
    assert.notEqual(tokenId, tokenIdAfterBurn)
    assert.notEqual(tokenIdAfterBurn, tokenId + 1n)
    compareBigNumbers(await lock.totalSupply(), totalSupply)
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
