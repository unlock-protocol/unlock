const { ethers } = require('hardhat')
const { assert } = require('chai')
const { deployLock, reverts, ADDRESS_ZERO } = require('../helpers')

let lock
let tx

describe('Lock / grantKeyExtension', () => {
  let keyOwner, anotherAccount
  let tokenId
  let evt
  let validExpirationTimestamp

  before(async () => {
    ;[, keyOwner, anotherAccount] = await ethers.getSigners()
    const blockNumber = await ethers.provider.getBlockNumber()
    const latestBlock = await ethers.provider.getBlock(blockNumber)
    validExpirationTimestamp = Math.round(latestBlock.timestamp + 600)

    lock = await deployLock()

    // the lock creator is assigned the KeyGranter role by default
    tx = await lock.grantKeys(
      [keyOwner.address],
      [validExpirationTimestamp],
      [ADDRESS_ZERO]
    )
    const { events } = await tx.wait()
    evt = events.find((v) => v.event === 'Transfer')
    tokenId = evt.args.tokenId
  })

  describe('extend a valid key', () => {
    let tsBefore
    before(async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
      tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      // extend
      tx = await lock.grantKeyExtension(tokenId)
    })

    it('key should stay valid', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
    })

    it('duration has been extended accordingly', async () => {
      const expirationDuration = await lock.expirationDuration()
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      assert.equal(
        tsBefore.add(expirationDuration).toString(),
        tsAfter.toString()
      )
    })

    it('should emit a KeyExtended event', async () => {
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      const { events } = await tx.wait()
      const { args } = events.find((v) => v.event === 'KeyExtended')
      assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
      assert.equal(args.newTimestamp.toNumber(), tsAfter.toNumber())
    })
  })

  describe('extend an expired key', () => {
    before(async () => {
      // expire key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.isValidKey(tokenId), false)

      // extend
      tx = await lock.grantKeyExtension(tokenId)
    })

    it('key should stay valid', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
    })

    it('duration has been extended accordingly', async () => {
      const expirationDuration = await lock.expirationDuration()
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      const blockNumber = await ethers.provider.getBlockNumber()
      const latestBlock = await ethers.provider.getBlock(blockNumber)
      assert.equal(
        latestBlock.timestamp + expirationDuration.toNumber(),
        tsAfter.toNumber()
      )
    })
  })

  describe('should fail', () => {
    // By default, the lockCreator has both the LockManager & KeyGranter roles
    it('if called by anyone but LockManager or KeyGranter', async () => {
      await reverts(
        lock.connect(keyOwner).grantKeyExtension(tokenId),
        'ONLY_LOCK_MANAGER_OR_KEY_GRANTER'
      )
      await reverts(
        lock.connect(anotherAccount).grantKeyExtension(tokenId),
        'ONLY_LOCK_MANAGER_OR_KEY_GRANTER'
      )
    })
    it('if key is not valid', async () => {
      await reverts(lock.grantKeyExtension(123), 'NO_SUCH_KEY')
    })
  })
})
