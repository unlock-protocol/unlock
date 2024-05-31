const assert = require('assert')
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
        value: keyPrice * BigInt(someBuyers.length),
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
    lock = await PublicLockPast.attach(newLockAddress)
    // add latest tempalte
    await unlock.addLockTemplate(await publicLockLatest.getAddress(), 10)
  })

  it('lock should have correct version', async () => {
    assert.equal(await lock.publicLockVersion(), pastVersion)
  })

  describe('data / schema migration with more than 100 records', () => {
    let receipts
    let tokenIds
    let totalSupply = 500

    before(async () => {
      const [, lockOwner, generousBuyer] = await ethers.getSigners()

      // create 500 random wallets
      // lets buy some key for each (with v9)
      receipts = await Promise.all(
        Array(totalSupply)
          .fill(0)
          .map(async () => {
            const { address: keyOwner } = await ethers.Wallet.createRandom()
            const tx = await lock
              .connect(generousBuyer)
              .purchase(0, keyOwner, ADDRESS_ZERO, ADDRESS_ZERO, '0x', {
                value: keyPrice,
              })
            const receipt = await tx.wait()
            const {
              args: { tokenId },
            } = await getEvent(receipt, 'Transfer')
            const expirationTimestamp =
              await lock.keyExpirationTimestampFor(keyOwner)
            return {
              keyOwner,
              tokenId,
              expirationTimestamp,
            }
          })
      )

      // sort by token id
      receipts = receipts.sort((a, b) =>
        parseInt(parseInt(a.tokenId.toString() - b.tokenId.toString()))
      )

      // make sure buys went thru
      assert.equal(await lock.totalSupply(), totalSupply)
      assert.equal(await lock.totalSupply(), BigInt(receipts.length))

      // update abi before upgrade, so we can track event
      lock = await PublicLockLatest.attach(await lock.getAddress())

      // we listen to event in the lock itself
      lock.once('KeysMigrated', (data) => {
        // make sure the event is firing the correct value
        assert.equal(data, 100)
      })

      // upgrade to latest version of the template
      const [, creator] = await ethers.getSigners()
      const tx = await unlock
        .connect(creator)
        .upgradeLock(await lock.getAddress(), pastVersion + 1n)
      const receipt = await tx.wait()

      // check if box instance works
      const evt = await getEvent(receipt, 'LockUpgraded')
      const { lockAddress, version } = evt.args

      // make sure upgrade event is correct
      assert.equal(lockAddress, await lock.getAddress())
      assert.equal(version, pastVersion + 1n)

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
      assert.equal(await lock.publicLockVersion(), pastVersion + 1n)
    })

    it('schemaVersion still undefined', async () => {
      assert.equal(await lock.schemaVersion(), 0)
    })

    it('relevant records have been updated', async () => {
      for (const { expirationTimestamp, tokenId, keyOwner } of receipts.splice(
        0,
        100
      )) {
        assert.equal(await lock.isValidKey(tokenId), true)
        assert.equal(await lock.ownerOf(tokenId), keyOwner)
        assert.equal(await lock.balanceOf(keyOwner), 1)
        assert.equal(await lock.getHasValidKey(keyOwner), true)
        assert.equal(
          await lock.keyExpirationTimestampFor(tokenId),
          expirationTimestamp
        )
      }
    })

    it('rest of the records have NOT been updated', async () => {
      for (const { tokenId, keyOwner } of receipts.splice(100, 200)) {
        assert.equal(await lock.isValidKey(tokenId), false)
        assert.equal(await lock.ownerOf(tokenId), keyOwner) // ownerOf should work regardless
        assert.equal(await lock.balanceOf(keyOwner), 0)
        assert.equal(await lock.getHasValidKey(keyOwner), false)
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
        for (const {
          expirationTimestamp,
          tokenId,
          keyOwner,
        } of receipts.splice(parseInt(updatedRecordsCount.toString()), 100)) {
          assert.equal(await lock.isValidKey(tokenId), true)
          assert.equal(await lock.ownerOf(tokenId), keyOwner)
          assert.equal(await lock.balanceOf(keyOwner), 1)
          assert.equal(await lock.getHasValidKey(keyOwner), true)
          assert.equal(
            await lock.keyExpirationTimestampFor(tokenId),
            expirationTimestamp
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
        const receipt2 = await tx2.wait()
        const { args: args2 } = await getEvent(receipt2, 'KeysMigrated')
        assert.equal(args2.updatedRecordsCount, 200)
      })

      it('rest of the records have been updated', async () => {
        for (const {
          expirationTimestamp,
          tokenId,
          keyOwner,
        } of receipts.splice(200, receipts.length - 1)) {
          assert.equal(await lock.isValidKey(tokenId), true)
          assert.equal(await lock.ownerOf(tokenId), keyOwner)
          assert.equal(await lock.balanceOf(keyOwner), 1)
          assert.equal(await lock.getHasValidKey(keyOwner), true)
          assert.equal(
            await lock.keyExpirationTimestampFor(tokenId),
            expirationTimestamp
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
                value: keyPrice * BigInt(someBuyers.length),
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
            const { tokenId, expirationTimestamp } = receipts[0]
            const tx = await lock
              .connect(someBuyers[0])
              .extend(0, tokenId, ADDRESS_ZERO, '0x', {
                value: keyPrice,
              })
            await tx.wait()
            assert.equal(
              (await lock.keyExpirationTimestampFor(tokenId)) >
                expirationTimestamp,
              true
            )
          })
        })
      })
    })
  })
})
