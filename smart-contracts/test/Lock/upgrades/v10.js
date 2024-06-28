const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../../helpers/errors')
const path = require('path')
const {
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
  ADDRESS_ZERO,
  getEvent,
  getEvents,
} = require('@unlock-protocol/hardhat-helpers')

const versionNumber = 9
const keyPrice = ethers.parseEther('0.01')

// pass proper root folder to helpers
const dirname = path.join(__dirname, '..')

describe('PublicLock upgrade  v9 > v10', () => {
  let lock
  let PublicLockLatest
  let PublicLockPast

  after(async () => await cleanupContractVersions(dirname))

  before(async function copyAndBuildContract() {
    this.timeout(200000)
    const [pathPublicLockPast, pathPublicLockLatest] =
      await copyAndBuildContractsAtVersion(dirname, [
        {
          contractName: 'PublicLock',
          version: versionNumber,
        },
        {
          contractName: 'PublicLock',
          version: versionNumber + 1,
        },
      ])

    PublicLockPast = await ethers.getContractFactory(pathPublicLockPast)
    PublicLockLatest = await ethers.getContractFactory(pathPublicLockLatest)

    // deploy latest version
  })

  beforeEach(async () => {
    const [, lockOwner] = await ethers.getSigners()
    // deploy a simple lock
    const args = [
      await lockOwner.getAddress(),
      60 * 60 * 24 * 30, // 30 days
      ADDRESS_ZERO,
      keyPrice,
      130,
      'A neat upgradeable lock!',
    ]

    lock = await upgrades.deployProxy(PublicLockPast, args)
  })

  describe('perform upgrade', async () => {
    let buyers
    let tokenIds
    let expirationTimestamps
    let totalSupplyBefore

    beforeEach(async () => {
      // buy some keys
      const signers = await ethers.getSigners()
      buyers = signers.slice(1, 11)

      // purchase many keys (in the correct order to make sure we can check them later)
      for (let i = 0; i < buyers.length; i++) {
        const keyOwner = buyers[i]
        await lock
          .connect(keyOwner)
          .purchase(
            0,
            await keyOwner.getAddress(),
            ADDRESS_ZERO,
            ADDRESS_ZERO,
            '0x',
            {
              value: keyPrice,
            }
          )
      }
      tokenIds = await Promise.all(
        buyers.map(async (b) => lock.getTokenIdFor(await b.getAddress()))
      )
      expirationTimestamps = await Promise.all(
        buyers.map(async (b) =>
          lock.keyExpirationTimestampFor(await b.getAddress())
        )
      )

      // make sure record is proper before upgrade
      assert.equal(await lock.publicLockVersion(), 9)
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
          unsafeSkipStorageCheck: true, // UNSECURE - but we need the flag as we are resizing the `__gap`
        }
      )

      // make sure ownership is preserved
      assert.equal(
        await lock.ownerOf(tokenIds[0]),
        await buyers[0].getAddress()
      )

      // set many keys
      const [, lockOwner] = await ethers.getSigners()
      await lock.connect(lockOwner).setMaxKeysPerAddress(10)
    })

    it('upgraded successfully ', async () => {
      assert.equal(await lock.publicLockVersion(), 10)
    })

    describe('without migrating data', () => {
      it('purchase should fail ', async () => {
        await reverts(
          lock.connect(buyers[0]).purchase(
            [],
            await Promise.all(buyers.map((k) => k.getAddress())),
            buyers.map(() => ADDRESS_ZERO),
            buyers.map(() => ADDRESS_ZERO),
            buyers.map(() => '0x'),
            {
              value: keyPrice * BigInt(buyers.length),
            }
          ),
          'MIGRATION_REQUIRED'
        )
      })
      it('grantKeys should fail ', async () => {
        await reverts(
          lock.connect(buyers[0]).grantKeys(
            await Promise.all(buyers.map((k) => k.getAddress())),
            buyers.map(() => Date.now()),
            buyers.map(() => ADDRESS_ZERO)
          ),
          'MIGRATION_REQUIRED'
        )
      })
      it('extend should fail ', async () => {
        await reverts(
          lock.connect(buyers[0]).extend(0, tokenIds[0], ADDRESS_ZERO, '0x', {
            value: keyPrice,
          }),
          'MIGRATION_REQUIRED'
        )
      })
    })

    it('totalSupply is preserved', async () => {
      assert.equal(totalSupplyBefore, await lock.totalSupply())
    })

    it('schemaVersion is undefined before migration', async () => {
      assert.equal(await lock.schemaVersion(), 0)
    })

    describe('complete data migration', () => {
      let updatedRecordsCount

      beforeEach(async () => {
        // migrate the keys
        const encoder = ethers.AbiCoder.defaultAbiCoder()
        const calldata = encoder.encode(['uint', 'uint'], [0, 100])
        const [, lockOwner] = await ethers.getSigners()
        const tx = await lock.connect(lockOwner).migrate(calldata)
        const receipt = await tx.wait()
        const { args } = await getEvent(receipt, 'KeysMigrated')
        updatedRecordsCount = args.updatedRecordsCount
      })

      it('fire the correct event w updatedRecordsCount', async () => {
        assert.equal(updatedRecordsCount, totalSupplyBefore)
      })

      it('schemaVersion has been updated', async () => {
        assert.equal(await lock.schemaVersion(), await lock.publicLockVersion())
      })

      it('preserves all keys data', async () => {
        const totalSupply = await lock.totalSupply()
        for (let i of Array(totalSupply).fill(0)) {
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
        const purchasedTokenIds = events.map(({ args }) => args.tokenId)
        assert.equal(purchasedTokenIds.length, buyers.length)
      })

      it('grantKeys should now work ', async () => {
        const tx = await lock.connect(buyers[0]).grantKeys(
          await Promise.all(buyers.map((k) => k.getAddress())),
          buyers.map(() => Date.now()),
          buyers.map(() => ADDRESS_ZERO)
        )
        const receipt = await tx.wait()
        const { events } = await getEvents(receipt, 'Transfer')
        const grantedTokenIds = events.map(({ args }) => args.tokenId)
        assert.equal(grantedTokenIds.length, buyers.length)
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
