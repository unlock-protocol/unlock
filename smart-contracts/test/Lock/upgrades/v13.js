const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
const path = require('path')

const {
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
  ADDRESS_ZERO,
  getEvents,
} = require('@unlock-protocol/hardhat-helpers')

// pass proper root folder to helpers
const dirname = path.join(__dirname, '..')

const keyPrice = ethers.parseEther('0.01')
const previousVersionNumber = 12
const nextVersionNumber = 13

const duration = 60 * 60 * 24 * 30 // 30 days
const currency = ADDRESS_ZERO
const price = ethers.parseEther('0.01')
const maxKeys = 20
const name = 'A neat upgradeable lock!'

describe('PublicLock upgrade v12 > v13', () => {
  let lock
  let PublicLockLatest
  let PublicLockPast

  after(async () => await cleanupContractVersions(dirname))

  before(async function () {
    // make sure mocha doesnt time out
    this.timeout(200000)

    // get contract versions
    const [pathPublicLockPast, pathPublicLockLatest] =
      await copyAndBuildContractsAtVersion(dirname, [
        { contractName: 'PublicLock', version: previousVersionNumber },
        { contractName: 'PublicLock', version: nextVersionNumber },
      ])

    // deploy past and latest version
    PublicLockPast = await ethers.getContractFactory(pathPublicLockPast)
    PublicLockLatest = await ethers.getContractFactory(pathPublicLockLatest)

    // deploy a simple lock
    const [, lockOwner] = await ethers.getSigners()
    const args = [
      await lockOwner.getAddress(),
      duration,
      currency,
      keyPrice,
      maxKeys,
      name,
    ]

    lock = await upgrades.deployProxy(PublicLockPast, args)

    // set many keys
    await lock.connect(lockOwner).updateLockConfig(duration, 20, 3)
  })

  it('past version has correct version number', async () => {
    assert.equal(await lock.publicLockVersion(), previousVersionNumber)
  })

  describe('perform upgrade', async () => {
    let buyers
    let tokenIds
    let expirationTimestamps
    let totalSupplyBefore

    before(async () => {
      // buy some keys
      const signers = await ethers.getSigners()
      buyers = signers.slice(1, 10)

      // purchase many keys
      const tx = await lock.purchase(
        [],
        await Promise.all(buyers.map((k) => k.getAddress())),
        buyers.map(() => ADDRESS_ZERO),
        buyers.map(() => ADDRESS_ZERO),
        buyers.map(() => '0x'),
        {
          value: keyPrice * BigInt(buyers.length),
        }
      )
      const receipt = await tx.wait()
      const { events } = await getEvents(receipt, 'Transfer')
      tokenIds = events.map(({ args }) => args.tokenId)

      expirationTimestamps = await Promise.all(
        tokenIds.map((tokenId) => lock.keyExpirationTimestampFor(tokenId))
      )

      // make sure record is proper before upgrade
      assert.equal(await lock.publicLockVersion(), previousVersionNumber)
      assert.equal(
        await lock.ownerOf(tokenIds[0]),
        await buyers[0].getAddress()
      )
      assert.equal(await lock.balanceOf(await buyers[0].getAddress()), 1)

      totalSupplyBefore = await lock.totalSupply()

      // deploy new implementation
      lock = await upgrades.upgradeProxy(
        await lock.getAddress(),
        PublicLockLatest,
        {
          // UNSECURE - but we need the flag as we are resizing the `__gap`
          // unsafeSkipStorageCheck: true,
        }
      )

      // make sure ownership is preserved
      assert.equal(
        await lock.ownerOf(tokenIds[0]),
        await buyers[0].getAddress()
      )
    })

    it('upgraded successfully ', async () => {
      assert.equal(await lock.publicLockVersion(), nextVersionNumber)
      assert.equal(await lock.name(), name)
      assert.equal(await lock.expirationDuration(), duration)
      assert.equal(await lock.keyPrice(), price)
      assert.equal(await lock.maxNumberOfKeys(), maxKeys)
      assert.equal(await lock.tokenAddress(), currency)
    })

    it('totalSupply is preserved', async () => {
      assert.equal(totalSupplyBefore, await lock.totalSupply())
    })

    it('schemaVersion is not set correctly before migration', async () => {
      assert.equal(await lock.schemaVersion(), previousVersionNumber)
    })

    describe('data migration', () => {
      before(async () => {
        await lock.migrate('0x')
      })

      it('schemaVersion has been updated', async () => {
        assert.equal(await lock.schemaVersion(), await lock.publicLockVersion())
      })

      it('preserves all keys data', async () => {
        const totalSupply = await lock.totalSupply()
        for (let i = 0; i < totalSupply; i++) {
          const tokenId = i + 1
          assert.equal(await lock.isValidKey(tokenId), true)
          assert.equal(
            await lock.ownerOf(tokenId),
            await buyers[i].getAddress()
          )
          assert.equal(await lock.balanceOf(await buyers[i].getAddress()), 1)
          assert.equal(
            await lock.getHasValidKey(await buyers[i].getAddress()),
            true
          )
          assert.equal(
            await lock.keyExpirationTimestampFor(tokenId),
            expirationTimestamps[i]
          )
        }
      })

      it('purchase should now work ', async () => {
        const tx = await lock.connect(buyers[0]).purchase(
          [],
          await Promise.all(buyers.map((k) => k.getAddress())),
          buyers.map(() => ADDRESS_ZERO),
          buyers.map(() => ADDRESS_ZERO),
          buyers.map(() => '0x'),
          {
            value: keyPrice * BigInt(buyers.length),
          }
        )
        const receipt = await tx.wait()
        const { events } = await getEvents(receipt, 'Transfer')
        tokenIds = events.map(({ args }) => args.tokenId)

        assert.equal(tokenIds.length, buyers.length)
      })

      it('grantKeys should now work ', async () => {
        const tx = await lock.connect(buyers[0]).grantKeys(
          await Promise.all(buyers.map((k) => k.getAddress())),
          buyers.map(() => Date.now()),
          buyers.map(() => ADDRESS_ZERO)
        )
        const receipt = await tx.wait()
        const { events } = await getEvents(receipt, 'Transfer')
        tokenIds = events.map(({ args }) => args.tokenId)

        assert.equal(tokenIds.length, buyers.length)
      })

      it('extend should now work ', async () => {
        const tx = await lock
          .connect(buyers[0])
          .extend(0, tokenIds[0], ADDRESS_ZERO, '0x', {
            value: keyPrice,
          })
        await tx.wait()
        assert.equal(
          (await lock.keyExpirationTimestampFor(tokenIds[0])) >
            expirationTimestamps[0],
          true
        )
      })
    })
  })
})
