const { ethers } = require('hardhat')
const assert = require('assert')

const {
  purchaseKey,
  reverts,
  deployLock,
  compareBigNumbers,
} = require('../helpers')

const timeAmount = BigInt('1000')

describe('Lock / mergeKeys', () => {
  let tokenId, tokenId2
  let keyOwner, keyOwner2, keyManager, rando
  let lock

  beforeEach(async () => {
    ;[, keyOwner, keyOwner2, keyManager, rando] = await ethers.getSigners()
    lock = await deployLock()
    ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    ;({ tokenId: tokenId2 } = await purchaseKey(
      lock,
      await keyOwner2.getAddress()
    ))
  })

  describe('merge some amount of time', () => {
    it('should transfer amount of time from key', async () => {
      const expTs = [
        await lock.keyExpirationTimestampFor(tokenId),
        await lock.keyExpirationTimestampFor(tokenId2),
      ]

      await lock.connect(keyOwner).mergeKeys(tokenId, tokenId2, timeAmount)
      compareBigNumbers(
        expTs[0] - timeAmount,
        await lock.keyExpirationTimestampFor(tokenId)
      )

      compareBigNumbers(
        expTs[1] + timeAmount,
        await lock.keyExpirationTimestampFor(tokenId2)
      )

      assert.equal(
        await lock.getHasValidKey(await keyOwner2.getAddress()),
        true
      )
      assert.equal(await lock.getHasValidKey(await keyOwner.getAddress()), true)
    })

    it('should allow key manager to call', async () => {
      const expTs = [
        await lock.keyExpirationTimestampFor(tokenId),
        await lock.keyExpirationTimestampFor(tokenId2),
      ]

      // set key manager
      await lock
        .connect(keyOwner)
        .setKeyManagerOf(tokenId, await keyManager.getAddress())

      // call from key manager
      await lock.connect(keyManager).mergeKeys(tokenId, tokenId2, timeAmount)

      compareBigNumbers(
        expTs[0] - timeAmount,
        await lock.keyExpirationTimestampFor(tokenId)
      )

      compareBigNumbers(
        expTs[1] + timeAmount,
        await lock.keyExpirationTimestampFor(tokenId2)
      )

      assert.equal(
        await lock.getHasValidKey(await keyOwner2.getAddress()),
        true
      )
      assert.equal(await lock.getHasValidKey(await keyOwner.getAddress()), true)
    })
  })

  describe('merge with entire available time on a key', () => {
    it('should allow to transfer the entire amount of time from key', async () => {
      const expTs = [
        await lock.keyExpirationTimestampFor(tokenId),
        await lock.keyExpirationTimestampFor(tokenId2),
      ]

      const { timestamp: now } = await ethers.provider.getBlock('latest')
      const remaining = expTs[0] - BigInt(now) - 1n

      await lock.connect(keyOwner).mergeKeys(tokenId, tokenId2, remaining)

      compareBigNumbers(
        expTs[0] - remaining,
        await lock.keyExpirationTimestampFor(tokenId)
      )

      compareBigNumbers(
        expTs[1] + remaining,
        await lock.keyExpirationTimestampFor(tokenId2)
      )

      assert.equal(await lock.isValidKey(tokenId), false)
      assert.equal(await lock.isValidKey(tokenId2), true)
      assert.equal(
        await lock.getHasValidKey(await keyOwner2.getAddress()),
        true
      )
      assert.equal(
        await lock.getHasValidKey(await keyOwner.getAddress()),
        false
      )
    })
  })
  describe('failures', () => {
    it('should fail if one of the key does not exist', async () => {
      await reverts(
        lock.connect(keyOwner).mergeKeys(123, tokenId2, timeAmount),
        'NO_SUCH_KEY'
      )
      await reverts(
        lock.connect(keyOwner).mergeKeys(tokenId, 123, timeAmount),
        'NO_SUCH_KEY'
      )
    })

    it('should fail if not key manager', async () => {
      await reverts(
        lock.connect(rando).mergeKeys(tokenId, tokenId2, timeAmount),
        'ONLY_KEY_MANAGER'
      )
    })

    it('should fail if time is not enough', async () => {
      const remaining = await lock.keyExpirationTimestampFor(tokenId)
      const { timestamp: now } = await ethers.provider.getBlock('latest')
      // remove some time
      await lock
        .connect(keyOwner)
        .shareKey(
          await rando.getAddress(),
          tokenId,
          remaining - BigInt(now) - 100n
        )

      assert.equal(
        (await lock.keyExpirationTimestampFor(tokenId)) - BigInt(now),
        100n
      )
      assert.equal(await lock.isValidKey(tokenId), true)
      await reverts(
        lock.connect(keyOwner).mergeKeys(tokenId, tokenId2, timeAmount),
        'NOT_ENOUGH_TIME'
      )
    })

    it('should fail if key is not valid', async () => {
      await lock.expireAndRefundFor(tokenId, 0)
      assert.equal(await lock.isValidKey(tokenId), false)
      await reverts(
        lock.mergeKeys(tokenId, tokenId2, timeAmount),
        'KEY_NOT_VALID'
      )
    })
  })
})
