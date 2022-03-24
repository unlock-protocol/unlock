const { ethers, upgrades, run } = require('hardhat')
const { reverts } = require('truffle-assertions')
const fs = require('fs-extra')
const path = require('path')
const createLockHash = require('../helpers/createLockCalldata')

const contractsPath = path.resolve(
  __dirname,
  '..',
  '..',
  'contracts',
  'past-versions'
)
const artifactsPath = path.resolve(
  __dirname,
  '..',
  '..',
  'artifacts',
  'contracts',
  'past-versions'
)

const versionNumber = 9
const keyPrice = ethers.utils.parseEther('0.01')

describe('upgradeLock / data migration', () => {
  let unlock
  let lock
  let pastVersion

  const pastPublicLockPath = require.resolve(
    `@unlock-protocol/contracts/dist/PublicLock/PublicLockV${versionNumber}.sol`
  )

  before(async function copyAndBuildContract() {
    // make sure mocha doesnt time out
    this.timeout(200000)

    await fs.copy(
      pastPublicLockPath,
      path.resolve(contractsPath, `PublicLockV${versionNumber}.sol`)
    )

    // re-compile contract using hardhat
    await run('compile')
  })

  after(async () => {
    await fs.remove(contractsPath)
    await fs.remove(artifactsPath)
  })

  beforeEach(async () => {
    const [unlockOwner, creator] = await ethers.getSigners()

    // deploy Unlock
    const Unlock = await ethers.getContractFactory('Unlock')
    unlock = await upgrades.deployProxy(Unlock, [unlockOwner.address], {
      initializer: 'initialize(address)',
    })
    await unlock.deployed()

    const PublicLockPast = await ethers.getContractFactory(
      `contracts/past-versions/PublicLockV${versionNumber}.sol:PublicLock`
    )
    const PublicLockLatest = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )

    // deploy past impl
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
      200, // 200 available keys
      'A neat upgradeable lock!',
    ]
    const calldata = await createLockHash({ args, from: creator.address })
    const tx = await unlock.createUpgradeableLock(calldata)
    const { events } = await tx.wait()
    const evt = events.find((v) => v.event === 'NewLock')
    const { newLockAddress } = evt.args

    // get lock
    lock = await ethers.getContractAt(
      `contracts/past-versions/PublicLockV${versionNumber}.sol:PublicLock`,
      newLockAddress
    )

    // deploy latest implementation
    const publicLockLatest = await PublicLockLatest.deploy()
    await publicLockLatest.deployed()
    await unlock.addLockTemplate(publicLockLatest.address, pastVersion + 1)
  })

  it('lock should have correct version', async () => {
    assert.equal(await lock.publicLockVersion(), pastVersion)
  })

  describe('data / schema migration with more than 100 records', () => {
    let keyOwners
    let tokenIds
    let expirationTimestamps

    beforeEach(async () => {
      const [, generousBuyer] = await ethers.getSigners()

      // create 110 random wallets
      keyOwners = await Promise.all(
        Array(110)
          .fill(0)
          .map(() => ethers.Wallet.createRandom())
      )

      // lets buy some key for each
      await Promise.all(
        keyOwners.map((_, i) =>
          lock
            .connect(generousBuyer)
            .purchase(
              0,
              keyOwners[i].address,
              web3.utils.padLeft(0, 40),
              web3.utils.padLeft(0, 40),
              [],
              {
                value: keyPrice,
              }
            )
        )
      )

      // make sure buys went thru
      assert.equal((await lock.totalSupply()).toNumber(), 110)

      tokenIds = await Promise.all(
        keyOwners.map((b) => lock.getTokenIdFor(b.address))
      )
      expirationTimestamps = await Promise.all(
        keyOwners.map((b) => lock.keyExpirationTimestampFor(b.address))
      )

      // deploy latest template
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

      // update abi
      lock = await ethers.getContractAt(
        'contracts/PublicLock.sol:PublicLock',
        lockAddress
      )
    })

    it('should have correct totalSupply', async () => {
      assert.equal((await lock.totalSupply()).toNumber(), 110)
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

    describe('features for key are deactivated', () => {
      let someBuyers
      beforeEach(async () => {
        const signers = await ethers.getSigners()
        someBuyers = signers.slice(1, 5)
      })

      it('purchase should fail ', async () => {
        await reverts(
          lock.connect(someBuyers[0]).purchase(
            [],
            someBuyers.map((k) => k.address),
            someBuyers.map(() => web3.utils.padLeft(0, 40)),
            someBuyers.map(() => web3.utils.padLeft(0, 40)),
            [],
            {
              value: (keyPrice * keyOwners.length).toFixed(),
            }
          ),
          'MIGRATION_REQUIRED'
        )
      })

      it('grantKeys should fail ', async () => {
        await reverts(
          lock.connect(someBuyers[0]).grantKeys(
            someBuyers.map((k) => k.address),
            someBuyers.map(() => Date.now()),
            someBuyers.map(() => web3.utils.padLeft(0, 40))
          ),
          'MIGRATION_REQUIRED'
        )
      })
      it('extend should fail ', async () => {
        const [, generousBuyer] = await ethers.getSigners()
        await reverts(
          lock
            .connect(generousBuyer)
            .extend(0, 1, web3.utils.padLeft(0, 40), [], {
              value: keyPrice,
            }),
          'MIGRATION_REQUIRED'
        )
      })
    })

    describe('relaunch remaining data migration', () => {
      beforeEach(async () => {
        // migrate only a few keys
        const [, lockOwner] = await ethers.getSigners()
        await lock.connect(lockOwner).migrateKeys(10)
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
            someBuyers.map(() => web3.utils.padLeft(0, 40)),
            someBuyers.map(() => web3.utils.padLeft(0, 40)),
            [],
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
            someBuyers.map(() => web3.utils.padLeft(0, 40))
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
            .extend(0, tokenIds[0], web3.utils.padLeft(0, 40), [], {
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
