const { assert } = require('chai')
const { ethers } = require('hardhat')

const { reverts, deployLock, purchaseKey } = require('../helpers')

const ONE_DAY = ethers.BigNumber.from(60 * 60 * 24)

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
      now = ethers.BigNumber.from(timestamp.toString())
      ;[, keyOwner] = await ethers.getSigners()
      ;({ tokenId } = await purchaseKey(lock, keyOwner.address))
    })

    it('in the past', async () => {
      const expirationTsBefore = await lock.keyExpirationTimestampFor(tokenId)
      const pastDate = now.sub(ONE_DAY)
      await lock.setKeyExpiration(tokenId, pastDate)
      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      assert.notEqual(expirationTsBefore.toString(), expirationTs.toString())
      assert.equal(expirationTs.toString(), pastDate.toString())
    })
    it('in the future', async () => {
      const expirationTsBefore = await lock.keyExpirationTimestampFor(tokenId)
      const futureDate = now.add(ONE_DAY)
      await lock.setKeyExpiration(tokenId, futureDate)
      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      assert.notEqual(expirationTsBefore.toString(), expirationTs.toString())
      assert.equal(expirationTs.toString(), futureDate.toString())
    })
    it('only lock manager', async () => {
      const [, , attacker] = await ethers.getSigners()
      await reverts(
        lock.connect(attacker).setKeyExpiration(tokenId, now.add(ONE_DAY)),
        'ONLY_LOCK_MANAGER'
      )
      await reverts(
        lock.connect(keyOwner).setKeyExpiration(tokenId, now.add(ONE_DAY)),
        'ONLY_LOCK_MANAGER'
      )
    })
  })
})
