const assert = require('assert')
const { ethers } = require('hardhat')

const { reverts, deployLock, purchaseKey } = require('../helpers')

const ONE_DAY = BigInt(60 * 60 * 24)

describe('Lock / setKeyExpiration', () => {
  let lock
  let keyOwner

  before(async () => {
    lock = await deployLock({ isEthers: true })
  })

  describe('update a key timestamp', () => {
    let tokenId
    let now

    beforeEach(async () => {
      const { timestamp } = await ethers.provider.getBlock('latest')
      now = BigInt(timestamp)
      ;[, keyOwner] = await ethers.getSigners()
      ;({ tokenId } = await purchaseKey(lock, await keyOwner.getAddress()))
    })

    it('in the past', async () => {
      const expirationTsBefore = await lock.keyExpirationTimestampFor(tokenId)
      const pastDate = now - ONE_DAY
      await lock.setKeyExpiration(tokenId, pastDate)
      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      assert.notEqual(expirationTsBefore, expirationTs)
      assert.equal(expirationTs, pastDate)
    })
    it('in the future', async () => {
      const expirationTsBefore = await lock.keyExpirationTimestampFor(tokenId)
      const futureDate = now + ONE_DAY
      await lock.setKeyExpiration(tokenId, futureDate)
      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      assert.notEqual(expirationTsBefore, expirationTs)
      assert.equal(expirationTs, futureDate)
    })
    it('only lock manager', async () => {
      const [, , attacker] = await ethers.getSigners()
      await reverts(
        lock.connect(attacker).setKeyExpiration(tokenId, now + ONE_DAY),
        'ONLY_LOCK_MANAGER'
      )
      await reverts(
        lock.connect(keyOwner).setKeyExpiration(tokenId, now + ONE_DAY),
        'ONLY_LOCK_MANAGER'
      )
    })
  })
})
