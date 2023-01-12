const { ethers } = require('hardhat')
const { deployLock, reverts, ADDRESS_ZERO } = require('../helpers')

let lock
let tx

// 10 minutes
const duration = 60 * 60 * 10

contract('Lock / grantKeyExtension', (accounts) => {
  const lockCreator = accounts[1]
  const keyOwner = accounts[2]
  let tokenId
  let evt
  let validExpirationTimestamp

  before(async () => {
    const blockNumber = await ethers.provider.getBlockNumber()
    const latestBlock = await ethers.provider.getBlock(blockNumber)
    validExpirationTimestamp = Math.round(latestBlock.timestamp + 600)

    lock = await deployLock({ from: lockCreator })

    // the lock creator is assigned the KeyGranter role by default
    tx = await lock.grantKeys(
      [keyOwner],
      [validExpirationTimestamp],
      [ADDRESS_ZERO],
      {
        from: lockCreator,
      }
    )
    evt = tx.logs.find((v) => v.event === 'Transfer')
    tokenId = evt.args.tokenId
  })

  describe('extend a valid key without a specific duration', () => {
    let tx
    let tsBefore
    before(async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
      tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      // extend
      tx = await lock.grantKeyExtension(tokenId, 0, {
        from: lockCreator,
      })
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
      const { args } = tx.logs.find((v) => v.event === 'KeyExtended')
      assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
      assert.equal(args.newTimestamp.toNumber(), tsAfter.toNumber())
    })
  })

  describe('extend a valid key with a specific duration', () => {
    let tx
    let tsBefore
    before(async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
      tsBefore = await lock.keyExpirationTimestampFor(tokenId)
      // extend
      tx = await lock.grantKeyExtension(tokenId, duration, {
        from: lockCreator,
      })
    })

    it('key should stay valid', async () => {
      assert.equal(await lock.isValidKey(tokenId), true)
    })

    it('duration has been extended accordingly', async () => {
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      assert.equal(tsBefore.toNumber() + duration, tsAfter.toNumber())
    })

    it('should emit a KeyExtended event', async () => {
      const tsAfter = await lock.keyExpirationTimestampFor(tokenId)
      const { args } = tx.logs.find((v) => v.event === 'KeyExtended')
      assert.equal(args.tokenId.toNumber(), tokenId.toNumber())
      assert.equal(args.newTimestamp.toNumber(), tsAfter.toNumber())
    })
  })

  describe('extend an expired key', () => {
    before(async () => {
      // expire key
      await lock.expireAndRefundFor(tokenId, 0, {
        from: lockCreator,
      })
      assert.equal(await lock.isValidKey(tokenId), false)

      // extend
      tx = await lock.grantKeyExtension(tokenId, 0, {
        from: lockCreator,
      })
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
        lock.grantKeyExtension(tokenId, duration, { from: keyOwner }),
        'ONLY_LOCK_MANAGER_OR_KEY_GRANTER'
      )
      await reverts(
        lock.grantKeyExtension(tokenId, duration, { from: accounts[9] }),
        'ONLY_LOCK_MANAGER_OR_KEY_GRANTER'
      )
    })
    it('if key is not valid', async () => {
      await reverts(
        lock.grantKeyExtension(123, duration, { from: lockCreator }),
        'NO_SUCH_KEY'
      )
    })
  })
})
