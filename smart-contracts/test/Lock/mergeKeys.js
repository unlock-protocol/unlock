const { ethers } = require('hardhat')
const { assert } = require('chai')

const { purchaseKeys, reverts, deployLock } = require('../helpers')

describe('Lock / mergeKeys', () => {
  let tokenIds
  let keyOwner, keyOwner2, keyManager, anotherAccount
  let lock

  beforeEach(async () => {
    lock = await deployLock()
    ;[, keyOwner, keyOwner2, keyManager, anotherAccount] =
      await ethers.getSigners()
    ;({ tokenIds } = await purchaseKeys(lock, 2))
  })

  describe('merge some amount of time', () => {
    it('should transfer amount of time from key', async () => {
      const expTs = [
        await lock.keyExpirationTimestampFor(tokenIds[0]),
        await lock.keyExpirationTimestampFor(tokenIds[1]),
      ]

      await lock.connect(keyOwner).mergeKeys(tokenIds[0], tokenIds[1], 1000)
      assert.equal(
        expTs[0].sub(1000).toString(),
        (await lock.keyExpirationTimestampFor(tokenIds[0])).toString()
      )

      assert.equal(
        expTs[1].add(1000).toString(),
        (await lock.keyExpirationTimestampFor(tokenIds[1])).toString()
      )

      assert.equal(await lock.getHasValidKey(keyOwner2.address), true)
      assert.equal(await lock.getHasValidKey(keyOwner.address), true)
    })
    it('should allow key manager to call', async () => {
      const expTs = [
        await lock.keyExpirationTimestampFor(tokenIds[0]),
        await lock.keyExpirationTimestampFor(tokenIds[1]),
      ]

      // set key manager
      await lock
        .connect(keyOwner)
        .setKeyManagerOf(tokenIds[0], keyManager.address)

      // call from key manager
      await lock.connect(keyManager).mergeKeys(tokenIds[0], tokenIds[1], 1000)

      assert.equal(
        expTs[0].sub(1000).toString(),
        (await lock.keyExpirationTimestampFor(tokenIds[0])).toString()
      )

      assert.equal(
        expTs[1].add(1000).toString(),
        (await lock.keyExpirationTimestampFor(tokenIds[1])).toString()
      )

      assert.equal(await lock.getHasValidKey(keyOwner2.address), true)
      assert.equal(await lock.getHasValidKey(keyOwner.address), true)
    })
  })

  describe('merge with entire available time on a key', () => {
    it('should allow to transfer the entire amount of time from key', async () => {
      const expTs = [
        await lock.keyExpirationTimestampFor(tokenIds[0]),
        await lock.keyExpirationTimestampFor(tokenIds[1]),
      ]

      const { timestamp: now } = await ethers.provider.getBlock('latest')
      const remaining = expTs[0] - now - 1

      await lock
        .connect(keyOwner)
        .mergeKeys(tokenIds[0], tokenIds[1], remaining)

      assert.equal(
        expTs[0].sub(remaining).toString(),
        (await lock.keyExpirationTimestampFor(tokenIds[0])).toString()
      )

      assert.equal(
        expTs[1].add(remaining).toString(),
        (await lock.keyExpirationTimestampFor(tokenIds[1])).toString()
      )

      assert.equal(await lock.isValidKey(tokenIds[0]), false)
      assert.equal(await lock.isValidKey(tokenIds[1]), true)
      assert.equal(await lock.getHasValidKey(keyOwner2.address), true)
      assert.equal(await lock.getHasValidKey(keyOwner.address), false)
    })
  })
  describe('failures', () => {
    it('should fail if one of the key does not exist', async () => {
      await reverts(
        lock.connect(keyOwner).mergeKeys(123, tokenIds[1], 1000),
        'NO_SUCH_KEY'
      )
      await reverts(
        lock.connect(keyOwner).mergeKeys(tokenIds[0], 123, 1000),
        'NO_SUCH_KEY'
      )
    })

    it('should fail if not key manager', async () => {
      await reverts(
        lock.connect(anotherAccount).mergeKeys(tokenIds[0], tokenIds[1], 1000),
        'ONLY_KEY_MANAGER'
      )
    })

    it('should fail if time is not enough', async () => {
      const remaining = await lock.keyExpirationTimestampFor(tokenIds[0])
      const { timestamp: now } = await ethers.provider.getBlock('latest')
      // remove some time
      await lock
        .connect(keyOwner)
        .shareKey(
          anotherAccount.address,
          tokenIds[0],
          remaining.sub(now).sub(100)
        )

      assert.equal(
        (await lock.keyExpirationTimestampFor(tokenIds[0])).sub(now),
        100
      )
      assert.equal(await lock.isValidKey(tokenIds[0]), true)
      await reverts(
        lock.connect(keyOwner).mergeKeys(tokenIds[0], tokenIds[1], 1000),
        'NOT_ENOUGH_TIME'
      )
    })

    it('should fail if key is not valid', async () => {
      await lock.expireAndRefundFor(tokenIds[0], 0)
      assert.equal(await lock.isValidKey(tokenIds[0]), false)
      await reverts(
        lock.mergeKeys(tokenIds[0], tokenIds[1], 1000),
        'KEY_NOT_VALID'
      )
    })
  })
})
