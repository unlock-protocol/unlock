const assert = require('assert')
const { ethers } = require('hardhat')
const {
  deployLock,
  reverts,
  ADDRESS_ZERO,
  compareBigNumbers,
} = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

let lock

// 10 minutes
const duration = BigInt(60 * 60 * 10)

describe('Lock / grantKeyExtension', () => {
  let keyOwner, attacker

  let tokenId
  let args
  let validExpirationTimestamp

  before(async () => {
    ;[, keyOwner, attacker] = await ethers.getSigners()

    const blockNumber = await ethers.provider.getBlockNumber()
    const latestBlock = await ethers.provider.getBlock(blockNumber)
    validExpirationTimestamp = Math.round(latestBlock.timestamp + 600)

    lock = await deployLock()

    // the lock creator is assigned the KeyGranter role by default
    const tx = await lock.grantKeys(
      [await keyOwner.getAddress()],
      [validExpirationTimestamp],
      [ADDRESS_ZERO]
    )
    const receipt = await tx.wait()
    ;({ args } = await getEvent(receipt, 'Transfer'))
    ;({ tokenId } = args)
  })

  describe('extend a valid key without a specific duration', () => {
    let tsBefore, args
    before(async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
      tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      // extend
      const tx = await lock.grantKeyExtension(tokenId, 0)
      const receipt = await tx.wait()
      ;({ args } = await getEvent(receipt, 'KeyExtended'))
    })

    it('key should stay valid', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
    })

    it('duration has been extended accordingly', async () => {
      const expirationDuration = await lock.expirationDuration()
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      compareBigNumbers(tsBefore + expirationDuration, tsAfter)
    })

    it('should emit a KeyExtended event', async () => {
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      compareBigNumbers(args.tokenId, tokenId)
      compareBigNumbers(args.newTimestamp, tsAfter)
    })
  })

  describe('extend a valid key with a specific duration', () => {
    let tsBefore, args
    before(async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
      tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      // extend
      const tx = await lock.grantKeyExtension(tokenId, duration)
      const receipt = await tx.wait()
      ;({ args } = await getEvent(receipt, 'KeyExtended'))
    })

    it('key should stay valid', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
    })

    it('duration has been extended accordingly', async () => {
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      compareBigNumbers(tsBefore + duration, tsAfter)
    })

    it('should emit a KeyExtended event', async () => {
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      compareBigNumbers(args.tokenId, tokenId)
      compareBigNumbers(args.newTimestamp, tsAfter)
    })
  })

  describe('extend an expired key', () => {
    before(async () => {
      // expire key
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.isValidKey(tokenId), false)

      // extend
      await lock.grantKeyExtension(tokenId, 0)
    })

    it('key should stay valid', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
    })

    it('duration has been extended accordingly', async () => {
      const expirationDuration = await lock.expirationDuration()
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      const blockNumber = await ethers.provider.getBlockNumber()
      const { timestamp } = await ethers.provider.getBlock(blockNumber)
      compareBigNumbers(expirationDuration + BigInt(timestamp), tsAfter)
    })
  })

  describe('should fail', () => {
    // By default, the lockCreator has both the LockManager & KeyGranter roles
    it('if called by anyone but LockManager or KeyGranter', async () => {
      await reverts(
        lock.connect(keyOwner).grantKeyExtension(tokenId, duration),
        'ONLY_LOCK_MANAGER_OR_KEY_GRANTER'
      )
      await reverts(
        lock.connect(attacker).grantKeyExtension(tokenId, duration),
        'ONLY_LOCK_MANAGER_OR_KEY_GRANTER'
      )
    })
    it('if key is not valid', async () => {
      await reverts(lock.grantKeyExtension(123, duration), 'NO_SUCH_KEY')
    })
  })
})
