/**
 * Tests for the lock data migration for PublicLock v10
 */
const { ethers, upgrades, run } = require('hardhat')
const { reverts } = require('truffle-assertions')
const fs = require('fs-extra')
const path = require('path')
const createLockHash = require('../../helpers/createLockCalldata')
const { ADDRESS_ZERO } = require('../../helpers/constants')

const contractsPath = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'contracts',
  'past-versions'
)
const artifactsPath = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'artifacts',
  'contracts',
  'past-versions'
)

const previousVersionNumber = 9 // to next version
const keyPrice = ethers.utils.parseEther('0.01')

// helpers
const purchaseFails = async (lock) => {
  const signers = await ethers.getSigners()
  const someBuyers = signers.slice(1, 5)
  await reverts(
    lock.connect(someBuyers[0]).purchase(
      [],
      someBuyers.map((k) => k.address),
      someBuyers.map(() => ADDRESS_ZERO),
      someBuyers.map(() => ADDRESS_ZERO),
      someBuyers.map(() => []),
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
      someBuyers.map((k) => k.address),
      someBuyers.map(() => Date.now()),
      someBuyers.map(() => ADDRESS_ZERO)
    ),
    'MIGRATION_REQUIRED'
  )
}

const extendFails = async (lock) => {
  const [, generousBuyer] = await ethers.getSigners()
  await reverts(
    lock.connect(generousBuyer).extend(0, 1, ADDRESS_ZERO, [], {
      value: keyPrice,
    }),
    'MIGRATION_REQUIRED'
  )
}

describe('upgradeLock / data migration', () => {
  let unlock
  let lock
  let pastVersion

  after(async () => {
    await fs.remove(contractsPath)
    await fs.remove(artifactsPath)
  })

  before(async function () {
    // make sure mocha doesnt time out
    this.timeout(200000)

    const [unlockOwner, creator] = await ethers.getSigners()

    // deploy latest implementation
    const PublicLockLatest = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )
    const publicLockLatest = await PublicLockLatest.deploy()
    await publicLockLatest.deployed()

    if ((await publicLockLatest.publicLockVersion()) !== 10) {
      this.skip()
    }

    // deploy Unlock
    const Unlock = await ethers.getContractFactory('Unlock')
    unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
      initializer: 'initialize(address)',
    })
    await unlock.deployed()

    // re-compile impl contract using hardhat
    await fs.copy(
      require.resolve(
        `@unlock-protocol/contracts/dist/PublicLock/PublicLockV${previousVersionNumber}.sol`
      ),
      path.resolve(contractsPath, `PublicLockV${previousVersionNumber}.sol`)
    )
    await run('compile')

    // deploy past impl
    const PublicLockPast = await ethers.getContractFactory(
      `contracts/past-versions/PublicLockV${previousVersionNumber}.sol:PublicLock`
    )

    const publicLockPast = await PublicLockPast.deploy()
    await publicLockPast.deployed()
    pastVersion = await publicLockPast.publicLockVersion()

    // add past impl to Unlock
    const txImpl = await unlock.addLockTemplate(
      publicLockPast.address,
      pastVersion
    )
    await txImpl.wait()

    // set v1 as main template
    await unlock.setLockTemplate(publicLockPast.address)

    // deploy a simple lock
    const args = [
      60 * 60 * 24 * 30, // 30 days
      ethers.constants.AddressZero,
      ethers.utils.parseEther('0.01'),
      1000, // available keys
      'A neat upgradeable lock!',
    ]
    const calldata = await createLockHash({ args, from: creator.address })
    const tx = await unlock.createUpgradeableLock(calldata)
    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'NewLock')
    const { newLockAddress } = evt.args

    // get lock
    lock = await ethers.getContractAt(
      `contracts/past-versions/PublicLockV${previousVersionNumber}.sol:PublicLock`,
      newLockAddress
    )

    // add latest tempalte
    await unlock.addLockTemplate(publicLockLatest.address, pastVersion + 1)
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
        keyOwners.map((_, i) =>
          lock
            .connect(generousBuyer)
            .purchase(0, keyOwners[i].address, ADDRESS_ZERO, ADDRESS_ZERO, [], {
              value: keyPrice,
            })
        )
      )

      // make sure buys went thru
      assert.equal((await lock.totalSupply()).toNumber(), totalSupply)

      tokenIds = await Promise.all(
        keyOwners.map((b) => lock.getTokenIdFor(b.address))
      )
      expirationTimestamps = await Promise.all(
        keyOwners.map((b) => lock.keyExpirationTimestampFor(b.address))
      )

      // update abi before upgrade, so we can track event
      lock = await ethers.getContractAt(
        'contracts/PublicLock.sol:PublicLock',
        lock.address
      )

      // we listen to event in the lock itself
      lock.once('KeysMigrated', (data) => {
        // make sure the event is firing the correct value
        assert.equal(data.toNumber(), 100)
      })

      // upgrade to latest version of the template
      const [, creator] = await ethers.getSigners()
      const tx = await unlock
        .connect(creator)
        .upgradeLock(lock.address, pastVersion + 1)
      const { events } = await tx.wait()

      // check if box instance works
      const evt = events.find((v) => v.event === 'LockUpgraded')
      const { lockAddress, version } = evt.args

      // make sure upgrade event is correct
      assert.equal(lockAddress, lock.address)
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
      assert.equal((await lock.totalSupply()).toNumber(), totalSupply)
    })

    it('Should have upgraded the lock with the new template', async () => {
      assert.equal(await unlock.publicLockLatestVersion(), pastVersion + 1)
      assert.equal(await lock.publicLockVersion(), pastVersion + 1)
    })

    it('schemaVersion still undefined', async () => {
      assert.equal((await lock.schemaVersion()).toNumber(), 0)
    })

    it('relevant records have been updated', async () => {
      for (let i = 0; i < 100; i++) {
        const tokenId = i + 1
        assert.equal(await lock.isValidKey(tokenId), true)
        assert.equal(await lock.ownerOf(tokenId), keyOwners[i].address)
        assert.equal(await lock.balanceOf(keyOwners[i].address), 1)
        assert.equal(await lock.getHasValidKey(keyOwners[i].address), true)
        assert.equal(
          (await lock.keyExpirationTimestampFor(tokenId)).toNumber(),
          expirationTimestamps[i].toNumber()
        )
      }
    })

    it('rest of the records have NOT been updated', async () => {
      const totalSupply = (await lock.totalSupply()).toNumber()
      for (let i = 100; i < totalSupply; i++) {
        const tokenId = i + 1
        assert.equal(await lock.isValidKey(tokenId), false)
        assert.equal(await lock.ownerOf(tokenId), keyOwners[i].address) // ownerOf should work regardless
        assert.equal(await lock.balanceOf(keyOwners[i].address), 0)
        assert.equal(await lock.getHasValidKey(keyOwners[i].address), false)
        assert.equal(
          (await lock.keyExpirationTimestampFor(tokenId)).toNumber(),
          0
        )
      }
    })

    describe('launch a partial data migration', () => {
      let updatedRecordsCount

      beforeEach(async () => {
        // migrate only a few keys
        const [, lockOwner] = await ethers.getSigners()

        // migrate a batch of 100
        const calldata = ethers.utils.defaultAbiCoder.encode(
          ['uint', 'uint'],
          [100, 100]
        )
        const tx = await lock.connect(lockOwner).migrate(calldata)
        const { events } = await tx.wait()
        const { args } = events.find((event) => event.event === 'KeysMigrated')
        updatedRecordsCount = args.updatedRecordsCount
      })

      describe('features for key are deactivated', () => {
        it('purchase should fail ', async () => await purchaseFails(lock))
        it('grantKeys should fail ', async () => await grantKeysFails(lock))
        it('extend should fail ', async () => await extendFails(lock))
      })

      it('returns the correct number of updated records', async () => {
        assert.equal(updatedRecordsCount.toNumber(), 100)
      })

      it('batch of 100 next records have been updated', async () => {
        for (let i = 100; i < 200; i++) {
          const tokenId = i + 1
          assert.equal(await lock.isValidKey(tokenId), true)
          assert.equal(await lock.ownerOf(tokenId), keyOwners[i].address)
          assert.equal(await lock.balanceOf(keyOwners[i].address), 1)
          assert.equal(await lock.getHasValidKey(keyOwners[i].address), true)
          assert.equal(
            (await lock.keyExpirationTimestampFor(tokenId)).toNumber(),
            expirationTimestamps[i].toNumber()
          )
        }
      })
    })

    describe('finalize the migration', () => {
      before(async () => {
        // migrate only a few keys
        const [, lockOwner] = await ethers.getSigners()

        // 200 already migrated, now add a first batch of 100
        const calldata1 = ethers.utils.defaultAbiCoder.encode(
          ['uint', 'uint'],
          [200, 100]
        )
        const tx = await lock.connect(lockOwner).migrate(calldata1)
        const { events } = await tx.wait()
        const { args } = events.find((v) => v.event === 'KeysMigrated')
        assert.equal(args.updatedRecordsCount.toNumber(), 100)

        // migrate another batch of 200
        const calldata2 = ethers.utils.defaultAbiCoder.encode(
          ['uint', 'uint'],
          [300, 200]
        )
        const tx2 = await lock.connect(lockOwner).migrate(calldata2)
        const { events: events2 } = await tx2.wait()
        const { args: args2 } = events2.find((v) => v.event === 'KeysMigrated')
        assert.equal(args2.updatedRecordsCount.toNumber(), 200)
      })

      it('rest of the records have been updated', async () => {
        const totalSupply = (await lock.totalSupply()).toNumber()
        for (let i = 100; i < totalSupply; i++) {
          const tokenId = i + 1
          assert.equal(await lock.isValidKey(tokenId), true)
          assert.equal(await lock.ownerOf(tokenId), keyOwners[i].address)
          assert.equal(await lock.balanceOf(keyOwners[i].address), 1)
          assert.equal(await lock.getHasValidKey(keyOwners[i].address), true)
          assert.equal(
            (await lock.keyExpirationTimestampFor(tokenId)).toNumber(),
            expirationTimestamps[i].toNumber()
          )
        }
      })

      it('schemaVersion still undefined', async () => {
        assert.equal((await lock.schemaVersion()).toNumber(), 0)
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
            (await lock.schemaVersion()).toNumber(),
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
              someBuyers.map((k) => k.address),
              someBuyers.map(() => ADDRESS_ZERO),
              someBuyers.map(() => ADDRESS_ZERO),
              someBuyers.map(() => []),
              {
                value: (keyPrice * someBuyers.length).toFixed(),
              }
            )
            const { events } = await tx.wait()

            const tokenIds = events
              .filter((v) => v.event === 'Transfer')
              .map(({ args }) => args.tokenId)

            assert.equal(tokenIds.length, someBuyers.length)
          })

          it('grantKeys should now work ', async () => {
            const tx = await lock.connect(someBuyers[0]).grantKeys(
              someBuyers.map((k) => k.address),
              someBuyers.map(() => Date.now()),
              someBuyers.map(() => ADDRESS_ZERO)
            )
            const { events } = await tx.wait()
            const tokenIds = events
              .filter((v) => v.event === 'Transfer')
              .map(({ args }) => args.tokenId)

            assert.equal(tokenIds.length, someBuyers.length)
          })

          it('extend should now work ', async () => {
            const tx = await lock
              .connect(someBuyers[0])
              .extend(0, tokenIds[0], ADDRESS_ZERO, [], {
                value: keyPrice,
              })
            await tx.wait()
            assert.equal(
              (await lock.keyExpirationTimestampFor(tokenIds[0])).gt(
                expirationTimestamps[0]
              ),
              true
            )
          })
        })
      })
    })
  })
})
