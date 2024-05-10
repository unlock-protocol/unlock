const { assert } = require('chai')
/**
 * Tests for the lock data migration for PublicLock v10
 */
const path = require('path')
const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../../helpers/errors')
const {
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
  createLockCalldata,
  ADDRESS_ZERO,
  getEvent,
  getEvents,
} = require('@unlock-protocol/hardhat-helpers')

// pass proper root folder to helpers
const dirname = path.join(__dirname, '..')

const previousVersionNumber = 9 // to next version
const keyPrice = ethers.parseEther('0.01')
const encoder = ethers.AbiCoder.defaultAbiCoder()

// helpers
const purchaseFails = async (lock) => {
  const signers = await ethers.getSigners()
  const someBuyers = signers.slice(1, 5)
  await reverts(
    lock.connect(someBuyers[0]).purchase(
      [],
      await Promise.all(someBuyers.map((k) => k.getAddress())),
      someBuyers.map(() => ADDRESS_ZERO),
      someBuyers.map(() => ADDRESS_ZERO),
      someBuyers.map(() => '0x'),
      {
        value: (keyPrice * someBuyers.length).toFixed(),
      }
    ),
    'MIGRATION_REQUIRED'
  )
}

const grantKeysFails = async (lock) => {
  const signers = await ethers.getSigners()
  const someBuyers = signers.slice(1, 5)
  await reverts(
    lock.connect(someBuyers[0]).grantKeys(
      await Promise.all(someBuyers.map((k) => k.getAddress())),
      someBuyers.map(() => Date.now()),
      someBuyers.map(() => ADDRESS_ZERO)
    ),
    'MIGRATION_REQUIRED'
  )
}

const extendFails = async (lock) => {
  const [, generousBuyer] = await ethers.getSigners()
  await reverts(
    lock.connect(generousBuyer).extend(0, 1, ADDRESS_ZERO, '0x', {
      value: keyPrice,
    }),
    'MIGRATION_REQUIRED'
  )
}

describe('upgradeLock / data migration v9 > v10', () => {
  let unlock
  let lock
  let pastVersion
  let PublicLockLatest, PublicLockPast

  after(async () => await cleanupContractVersions(__dirname))

  before(async function () {
    // make sure mocha doesnt time out
    this.timeout(200000)

    const [unlockOwner, creator] = await ethers.getSigners()

    // deploy latest implementation
    const [pathPublicLockPast, pathPublicLockLatest] =
      await copyAndBuildContractsAtVersion(dirname, [
        {
          contractName: 'PublicLock',
          version: previousVersionNumber,
        },
        {
          contractName: 'PublicLock',
          version: previousVersionNumber + 1,
        },
      ])

    PublicLockPast = await ethers.getContractFactory(pathPublicLockPast)
    PublicLockLatest = await ethers.getContractFactory(pathPublicLockLatest)

    // deploy latest version
    const publicLockLatest = await PublicLockLatest.deploy()

    // deploy old version
    const publicLockPast = await PublicLockPast.deploy()
    pastVersion = await publicLockPast.publicLockVersion()

    // deploy Unlock
    const Unlock = await ethers.getContractFactory(
      'contracts/Unlock.sol:Unlock'
    )
    unlock = await upgrades.deployProxy(
      Unlock,
      [await unlockOwner.getAddress()],
      {
        initializer: 'initialize(address)',
      }
    )

    // add past impl to Unlock
    await unlock.addLockTemplate(await publicLockPast.getAddress(), pastVersion)

    // set v1 as main template
    await unlock.setLockTemplate(await publicLockPast.getAddress())

    // deploy a simple lock
    const args = [
      60 * 60 * 24 * 30, // 30 days
      ADDRESS_ZERO,
      ethers.parseEther('0.01'),
      1000, // available keys
      'A neat upgradeable lock!',
    ]
    const calldata = await createLockCalldata({
      args,
      from: await creator.getAddress(),
    })
    const tx = await unlock.createUpgradeableLock(calldata)
    const receipt = await tx.wait()
    const evt = await getEvent(receipt, 'NewLock')
    const { newLockAddress } = evt.args

    // get lock
    lock = await ethers.getContractAt(
      PublicLockPast.interface.format(ethers.FormatTypes.full),
      newLockAddress
    )
    // add latest tempalte
    await unlock.addLockTemplate(await publicLockLatest.getAddress(), 10)
  })

  it('lock should have correct version', async () => {
    assert.equal(await lock.publicLockVersion(), pastVersion)
  })

  describe('data / schema migration with more than 100 records', () => {
    let keyOwners
    let tokenIds
    let expirationTimestamps
    let totalSupply = 500

    before(async () => {
      const [, lockOwner, generousBuyer] = await ethers.getSigners()

      // create 500 random wallets
      keyOwners = await Promise.all(
        Array(totalSupply)
          .fill(0)
          .map(() => ethers.Wallet.createRandom())
      )

      // lets buy some key for each (with v9)
      await Promise.all(
        keyOwners.map(
          async (_, i) =>
            await lock
              .connect(generousBuyer)
              .purchase(
                0,
                await keyOwners[i].getAddress(),
                ADDRESS_ZERO,
                ADDRESS_ZERO,
                [],
                {
                  value: keyPrice,
                }
              )
        )
      )

      // make sure buys went thru
      assert.equal(await lock.totalSupply(), totalSupply)

      tokenIds = await Promise.all(
        keyOwners.map(
          async (b) => await lock.getTokenIdFor(await b.getAddress())
        )
      )
      expirationTimestamps = await Promise.all(
        keyOwners.map(
          async (b) =>
            await lock.keyExpirationTimestampFor(await b.getAddress())
        )
      )

      // update abi before upgrade, so we can track event
      lock = await ethers.getContractAt(
        PublicLockLatest.interface.format(ethers.FormatTypes.full),
        await lock.getAddress()
      )

      // we listen to event in the lock itself
      lock.once('KeysMigrated', (data) => {
        // make sure the event is firing the correct value
        assert.equal(data, 100)
      })

      // upgrade to latest version of the template
      const [, creator] = await ethers.getSigners()
      const tx = await unlock
        .connect(creator)
        .upgradeLock(await lock.getAddress(), pastVersion + 1)
      const receipt = await tx.wait()

      // check if box instance works
      const evt = await getEvent(receipt, 'LockUpgraded')
      const { lockAddress, version } = evt.args

      // make sure upgrade event is correct
      assert.equal(lockAddress, await lock.getAddress())
      assert.equal(version, pastVersion + 1)

      // set multiple keys
      await lock.connect(lockOwner).setMaxKeysPerAddress(10)
    })

    describe('features for key are deactivated', () => {
      it('purchase should fail ', async () => await purchaseFails(lock))
      it('grantKeys should fail ', async () => await grantKeysFails(lock))
      it('extend should fail ', async () => await extendFails(lock))
    })

    it('should have correct totalSupply', async () => {
      assert.equal(await lock.totalSupply(), totalSupply)
    })

    it('Should have upgraded the lock with the new template', async () => {
      assert.equal(await lock.publicLockVersion(), pastVersion + 1)
    })

    it('schemaVersion still undefined', async () => {
      assert.equal(await lock.schemaVersion(), 0)
    })

    it('relevant records have been updated', async () => {
      for (let i = 0; i < 100; i++) {
        const tokenId = i + 1
        assert.equal(await lock.isValidKey(tokenId), true)
        assert.equal(
          await lock.ownerOf(tokenId),
          await keyOwners[i].getAddress()
        )
        assert.equal(await lock.balanceOf(await keyOwners[i].getAddress()), 1)
        assert.equal(
          await lock.getHasValidKey(await keyOwners[i].getAddress()),
          true
        )
        assert.equal(
          await lock.keyExpirationTimestampFor(tokenId),
          expirationTimestamps[i]
        )
      }
    })

    it('rest of the records have NOT been updated', async () => {
      const totalSupply = await lock.totalSupply()
      for (let i = 100; i < totalSupply; i++) {
        const tokenId = i + 1
        assert.equal(await lock.isValidKey(tokenId), false)
        assert.equal(
          await lock.ownerOf(tokenId),
          await keyOwners[i].getAddress()
        ) // ownerOf should work regardless
        assert.equal(await lock.balanceOf(await keyOwners[i].getAddress()), 0)
        assert.equal(
          await lock.getHasValidKey(await keyOwners[i].getAddress()),
          false
        )
        assert.equal(await lock.keyExpirationTimestampFor(tokenId), 0)
      }
    })

    describe('launch a partial data migration', () => {
      let updatedRecordsCount

      beforeEach(async () => {
        // migrate only a few keys
        const [, lockOwner] = await ethers.getSigners()

        // migrate a batch of 100
        const calldata = encoder.encode(['uint', 'uint'], [100, 100])
        const tx = await lock.connect(lockOwner).migrate(calldata)
        const receipt = await tx.wait()
        const { args } = await getEvent(receipt, 'KeysMigrated')
        updatedRecordsCount = args.updatedRecordsCount
      })

      describe('features for key are deactivated', () => {
        it('purchase should fail ', async () => await purchaseFails(lock))
        it('grantKeys should fail ', async () => await grantKeysFails(lock))
        it('extend should fail ', async () => await extendFails(lock))
      })

      it('returns the correct number of updated records', async () => {
        assert.equal(updatedRecordsCount, 100)
      })

      it('batch of 100 next records have been updated', async () => {
        for (let i = 100; i < 200; i++) {
          const tokenId = i + 1
          assert.equal(await lock.isValidKey(tokenId), true)
          assert.equal(
            await lock.ownerOf(tokenId),
            await keyOwners[i].getAddress()
          )
          assert.equal(await lock.balanceOf(await keyOwners[i].getAddress()), 1)
          assert.equal(
            await lock.getHasValidKey(await keyOwners[i].getAddress()),
            true
          )
          assert.equal(
            await lock.keyExpirationTimestampFor(tokenId),
            expirationTimestamps[i]
          )
        }
      })
    })

    describe('finalize the migration', () => {
      before(async () => {
        // migrate only a few keys
        const [, lockOwner] = await ethers.getSigners()

        // 200 already migrated, now add a first batch of 100
        const calldata1 = encoder.encode(['uint', 'uint'], [200, 100])
        const tx = await lock.connect(lockOwner).migrate(calldata1)
        const receipt = await tx.wait()
        const { args } = await getEvent(receipt, 'KeysMigrated')
        assert.equal(args.updatedRecordsCount, 100)

        // migrate another batch of 200
        const calldata2 = encoder.encode(['uint', 'uint'], [300, 200])
        const tx2 = await lock.connect(lockOwner).migrate(calldata2)
        const { events: events2 } = await tx2.wait()
        const { args: args2 } = events2.find((v) => v.event === 'KeysMigrated')
        assert.equal(args2.updatedRecordsCount, 200)
      })

      it('rest of the records have been updated', async () => {
        const totalSupply = await lock.totalSupply()
        for (let i = 100; i < totalSupply; i++) {
          const tokenId = i + 1
          assert.equal(await lock.isValidKey(tokenId), true)
          assert.equal(
            await lock.ownerOf(tokenId),
            await keyOwners[i].getAddress()
          )
          assert.equal(await lock.balanceOf(await keyOwners[i].getAddress()), 1)
          assert.equal(
            await lock.getHasValidKey(await keyOwners[i].getAddress()),
            true
          )
          assert.equal(
            await lock.keyExpirationTimestampFor(tokenId),
            expirationTimestamps[i]
          )
        }
      })

      it('schemaVersion still undefined', async () => {
        assert.equal(await lock.schemaVersion(), 0)
      })

      describe('features for key are deactivated', () => {
        it('purchase should fail ', async () => await purchaseFails(lock))
        it('grantKeys should fail ', async () => await grantKeysFails(lock))
        it('extend should fail ', async () => await extendFails(lock))
      })

      describe('activate the schema version', async () => {
        before(async () => {
          const [, lockManager] = await ethers.getSigners()

          await lock.connect(lockManager).updateSchemaVersion()
        })

        it('schemaVersion has been updated', async () => {
          assert.equal(
            await lock.schemaVersion(),
            await lock.publicLockVersion()
          )
        })

        describe('features for key are now activated', () => {
          let someBuyers
          beforeEach(async () => {
            const signers = await ethers.getSigners()
            someBuyers = signers.slice(1, 5)
          })
          it('purchase should now work ', async () => {
            const tx = await lock.connect(someBuyers[0]).purchase(
              [],
              await Promise.all(someBuyers.map((k) => k.getAddress())),
              someBuyers.map(() => ADDRESS_ZERO),
              someBuyers.map(() => ADDRESS_ZERO),
              someBuyers.map(() => '0x'),
              {
                value: (keyPrice * someBuyers.length).toFixed(),
              }
            )
            const receipt = await tx.wait()
            const { events } = await getEvents(receipt, 'Transfer')
            tokenIds = events.map(({ args }) => args.tokenId)

            assert.equal(tokenIds.length, someBuyers.length)
          })

          it('grantKeys should now work ', async () => {
            const tx = await lock.connect(someBuyers[0]).grantKeys(
              await Promise.all(someBuyers.map((k) => k.getAddress())),
              someBuyers.map(() => Date.now()),
              someBuyers.map(() => ADDRESS_ZERO)
            )
            const receipt = await tx.wait()
            const { events } = await getEvents(receipt, 'Transfer')
            tokenIds = events.map(({ args }) => args.tokenId)

            assert.equal(tokenIds.length, someBuyers.length)
          })

          it('extend should now work ', async () => {
            const tx = await lock
              .connect(someBuyers[0])
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
  })
})
