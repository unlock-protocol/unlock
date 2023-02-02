const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../../helpers/errors')
const { ADDRESS_ZERO } = require('../../helpers/constants')
const {
  getContractFactoryAtVersion,
  cleanupPastContracts,
} = require('../../helpers/versions')

const versionNumber = 9
const keyPrice = ethers.utils.parseEther('0.01')

describe('PublicLock upgrade  v9 > v10', () => {
  let lock
  let PublicLockLatest
  let PublicLockPast

  after(async () => await cleanupPastContracts())

  before(async function copyAndBuildContract() {
    this.timeout(200000)
    PublicLockPast = await getContractFactoryAtVersion(
      'PublicLock',
      versionNumber
    )
    PublicLockLatest = await getContractFactoryAtVersion(
      'PublicLock',
      versionNumber + 1
    )
  })

  beforeEach(async () => {
    const [, lockOwner] = await ethers.getSigners()
    // deploy a simple lock
    const args = [
      lockOwner.address,
      60 * 60 * 24 * 30, // 30 days
      ADDRESS_ZERO,
      keyPrice,
      130,
      'A neat upgradeable lock!',
    ]

    lock = await upgrades.deployProxy(PublicLockPast, args)
    await lock.deployed()
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

      // purchase many keys
      await Promise.all(
        buyers.map((keyOwner) =>
          lock
            .connect(keyOwner)
            .purchase(0, keyOwner.address, ADDRESS_ZERO, ADDRESS_ZERO, [], {
              value: keyPrice,
            })
        )
      )

      tokenIds = await Promise.all(
        buyers.map((b) => lock.getTokenIdFor(b.address))
      )
      expirationTimestamps = await Promise.all(
        buyers.map((b) => lock.keyExpirationTimestampFor(b.address))
      )

      // make sure record is proper before upgrade
      assert.equal(await lock.publicLockVersion(), 9)
      assert.equal(await lock.ownerOf(tokenIds[0]), buyers[0].address)
      assert.equal(await lock.balanceOf(buyers[0].address), 1)

      totalSupplyBefore = await lock.totalSupply()

      // deploy new implementation
      lock = await upgrades.upgradeProxy(lock.address, PublicLockLatest, {
        unsafeSkipStorageCheck: true, // UNSECURE - but we need the flag as we are resizing the `__gap`
      })

      // make sure ownership is preserved
      assert.equal(await lock.ownerOf(tokenIds[0]), buyers[0].address)

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
            buyers.map((k) => k.address),
            buyers.map(() => ADDRESS_ZERO),
            buyers.map(() => ADDRESS_ZERO),
            buyers.map(() => []),
            {
              value: (keyPrice * buyers.length).toFixed(),
            }
          ),
          'MIGRATION_REQUIRED'
        )
      })
      it('grantKeys should fail ', async () => {
        await reverts(
          lock.connect(buyers[0]).grantKeys(
            buyers.map((k) => k.address),
            buyers.map(() => Date.now()),
            buyers.map(() => ADDRESS_ZERO)
          ),
          'MIGRATION_REQUIRED'
        )
      })
      it('extend should fail ', async () => {
        await reverts(
          lock.connect(buyers[0]).extend(0, tokenIds[0], ADDRESS_ZERO, [], {
            value: keyPrice,
          }),
          'MIGRATION_REQUIRED'
        )
      })
    })

    it('totalSupply is preserved', async () => {
      assert.equal(
        totalSupplyBefore.toNumber(),
        (await lock.totalSupply()).toNumber()
      )
    })

    it('schemaVersion is undefined before migration', async () => {
      assert.equal((await lock.schemaVersion()).toNumber(), 0)
    })

    describe('complete data migration', () => {
      let updatedRecordsCount

      beforeEach(async () => {
        // migrate the keys
        const calldata = ethers.utils.defaultAbiCoder.encode(
          ['uint', 'uint'],
          [0, 100]
        )
        const [, lockOwner] = await ethers.getSigners()
        const tx = await lock.connect(lockOwner).migrate(calldata)
        const { events } = await tx.wait()
        const { args } = events.find((v) => v.event === 'KeysMigrated')
        updatedRecordsCount = args.updatedRecordsCount
      })

      it('fire the correct event w updatedRecordsCount', async () => {
        assert.equal(updatedRecordsCount.toNumber(), totalSupplyBefore)
      })

      it('schemaVersion has been updated', async () => {
        assert.equal(await lock.schemaVersion(), await lock.publicLockVersion())
      })

      it('preserves all keys data', async () => {
        const totalSupply = (await lock.totalSupply()).toNumber()
        for (let i = 0; i < totalSupply; i++) {
          const tokenId = i + 1
          assert.equal(await lock.isValidKey(tokenId), true)
          assert.equal(await lock.ownerOf(tokenId), buyers[i].address)
          assert.equal(await lock.balanceOf(buyers[i].address), 1)
          assert.equal(await lock.getHasValidKey(buyers[i].address), true)
          assert.equal(
            (await lock.keyExpirationTimestampFor(tokenId)).toNumber(),
            expirationTimestamps[i].toNumber()
          )
        }
      })

      it('purchase should now work ', async () => {
        const tx = await lock.connect(buyers[0]).purchase(
          [],
          buyers.map((k) => k.address),
          buyers.map(() => ADDRESS_ZERO),
          buyers.map(() => ADDRESS_ZERO),
          buyers.map(() => []),
          {
            value: (keyPrice * buyers.length).toFixed(),
          }
        )
        const { events } = await tx.wait()

        const tokenIds = events
          .filter((v) => v.event === 'Transfer')
          .map(({ args }) => args.tokenId)

        assert.equal(tokenIds.length, buyers.length)
      })

      it('grantKeys should now work ', async () => {
        const tx = await lock.connect(buyers[0]).grantKeys(
          buyers.map((k) => k.address),
          buyers.map(() => Date.now()),
          buyers.map(() => ADDRESS_ZERO)
        )
        const { events } = await tx.wait()
        const tokenIds = events
          .filter((v) => v.event === 'Transfer')
          .map(({ args }) => args.tokenId)

        assert.equal(tokenIds.length, buyers.length)
      })

      it('extend should now work ', async () => {
        const tx = await lock
          .connect(buyers[0])
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
