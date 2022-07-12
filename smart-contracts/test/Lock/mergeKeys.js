const { ethers } = require('hardhat')
const BigNumber = require('bignumber.js')
const { assert } = require('chai')

const { purchaseKeys, reverts, deployLock } = require('../helpers')

contract('Lock / mergeKeys', (accounts) => {
  let tokenIds
  let lockCreator = accounts[0]
  let keyOwner = accounts[1]
  let keyOwner2 = accounts[2]
  let lock

  beforeEach(async () => {
    lock = await deployLock()
    ;({ tokenIds } = await purchaseKeys(lock, 2))
  })

  describe('merge some amount of time', () => {
    it('should transfer amount of time from key', async () => {
      const expTs = [
        await lock.keyExpirationTimestampFor(tokenIds[0]),
        await lock.keyExpirationTimestampFor(tokenIds[1]),
      ]

      await lock.mergeKeys(tokenIds[0], tokenIds[1], 1000, { from: keyOwner })
      assert.equal(
        new BigNumber(expTs[0]).minus(1000).toString(),
        new BigNumber(
          await lock.keyExpirationTimestampFor(tokenIds[0])
        ).toString()
      )

      assert.equal(
        new BigNumber(expTs[1]).plus(1000).toString(),
        new BigNumber(
          await lock.keyExpirationTimestampFor(tokenIds[1])
        ).toString()
      )

      assert.equal(await lock.getHasValidKey(keyOwner2), true)
      assert.equal(await lock.getHasValidKey(keyOwner), true)
    })
    it('should allow key manager to call', async () => {
      const expTs = [
        await lock.keyExpirationTimestampFor(tokenIds[0]),
        await lock.keyExpirationTimestampFor(tokenIds[1]),
      ]

      // set key manager
      await lock.setKeyManagerOf(tokenIds[0], accounts[9], {
        from: keyOwner,
      })

      // call from key manager
      await lock.mergeKeys(tokenIds[0], tokenIds[1], 1000, {
        from: accounts[9],
      })

      assert.equal(
        new BigNumber(expTs[0]).minus(1000).toString(),
        new BigNumber(
          await lock.keyExpirationTimestampFor(tokenIds[0])
        ).toString()
      )

      assert.equal(
        new BigNumber(expTs[1]).plus(1000).toString(),
        new BigNumber(
          await lock.keyExpirationTimestampFor(tokenIds[1])
        ).toString()
      )

      assert.equal(await lock.getHasValidKey(keyOwner2), true)
      assert.equal(await lock.getHasValidKey(keyOwner), true)
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

      await lock.mergeKeys(tokenIds[0], tokenIds[1], remaining, {
        from: keyOwner,
      })

      assert.equal(
        new BigNumber(expTs[0]).minus(remaining).toString(),
        new BigNumber(
          await lock.keyExpirationTimestampFor(tokenIds[0])
        ).toString()
      )

      assert.equal(
        new BigNumber(expTs[1]).plus(remaining).toString(),
        new BigNumber(
          await lock.keyExpirationTimestampFor(tokenIds[1])
        ).toString()
      )

      assert.equal(await lock.isValidKey(tokenIds[0]), false)
      assert.equal(await lock.isValidKey(tokenIds[1]), true)
      assert.equal(await lock.getHasValidKey(keyOwner2), true)
      assert.equal(await lock.getHasValidKey(keyOwner), false)
    })
  })
  describe('failures', () => {
    it('should fail if one of the key does not exist', async () => {
      await reverts(
        lock.mergeKeys(123, tokenIds[1], 1000, { from: keyOwner }),
        'NO_SUCH_KEY'
      )
      await reverts(
        lock.mergeKeys(tokenIds[0], 123, 1000, { from: keyOwner }),
        'NO_SUCH_KEY'
      )
    })

    it('should fail if not key manager', async () => {
      await reverts(
        lock.mergeKeys(tokenIds[0], tokenIds[1], 1000, { from: accounts[9] }),
        'ONLY_KEY_MANAGER'
      )
    })

    it('should fail if time is not enough', async () => {
      const remaining = await lock.keyExpirationTimestampFor(tokenIds[0])
      const { timestamp: now } = await ethers.provider.getBlock('latest')
      // remove some time
      await lock.shareKey(
        accounts[8],
        tokenIds[0],
        remaining.toNumber() - now - 100,
        { from: keyOwner }
      )

      assert.equal(
        new BigNumber(
          await lock.keyExpirationTimestampFor(tokenIds[0])
        ).toNumber() - now,
        100
      )
      assert.equal(await lock.isValidKey(tokenIds[0]), true)
      await reverts(
        lock.mergeKeys(tokenIds[0], tokenIds[1], 1000, { from: keyOwner }),
        'NOT_ENOUGH_TIME'
      )
    })

    it('should fail if key is not valid', async () => {
      await lock.expireAndRefundFor(tokenIds[0], 0, {
        from: lockCreator,
      })
      assert.equal(await lock.isValidKey(tokenIds[0]), false)
      await reverts(
        lock.mergeKeys(tokenIds[0], tokenIds[1], 1000),
        'KEY_NOT_VALID'
      )
    })
  })
})
