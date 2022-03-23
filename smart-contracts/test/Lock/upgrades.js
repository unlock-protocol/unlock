const { ethers, upgrades, run } = require('hardhat')
const { reverts } = require('truffle-assertions')
const fs = require('fs-extra')
const path = require('path')

// const {
//   LATEST_PUBLIC_LOCK_VERSION,
// } = require('../helpers/constants')

// files path
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

describe('PublicLock upgrades', () => {
  let lock
  let PublicLockLatest
  let PublicLockPast

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
    PublicLockPast = await ethers.getContractFactory(
      `contracts/past-versions/PublicLockV${versionNumber}.sol:PublicLock`
    )
    PublicLockLatest = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )

    const [, lockOwner] = await ethers.getSigners()
    // deploy a simple lock
    const args = [
      lockOwner.address,
      60 * 60 * 24 * 30, // 30 days
      ethers.constants.AddressZero,
      keyPrice,
      10,
      'A neat upgradeable lock!',
    ]

    lock = await upgrades.deployProxy(PublicLockPast, args)
    await lock.deployed()
  })

  describe.only('perform upgrade', async () => {
    let keyOwner
    let tokenId
    let totalSupplyBefore

    beforeEach(async () => {
      // buy some keys
      ;[, , keyOwner] = await ethers.getSigners()

      // Purchase a key
      await lock
        .connect(keyOwner)
        .purchase(
          0,
          keyOwner.address,
          web3.utils.padLeft(0, 40),
          web3.utils.padLeft(0, 40),
          [],
          {
            value: keyPrice,
          }
        )

      tokenId = await lock.getTokenIdFor(keyOwner.address)

      // make sure record is proper before upgrade
      assert.equal(await lock.publicLockVersion(), 9)
      assert.equal(await lock.ownerOf(tokenId), keyOwner.address)
      assert.equal(await lock.balanceOf(keyOwner.address), 1)

      totalSupplyBefore = await lock.totalSupply()

      // deploy new implementation
      lock = await upgrades.upgradeProxy(lock.address, PublicLockLatest, {
        unsafeSkipStorageCheck: true, // HIGHLY UNSECURE - just for testing purposes
      })
    })

    it('upgraded successfully ', async () => {
      assert.equal(await lock.publicLockVersion(), 10)
    })

    describe('without migrating data', () => {
      it('purchase should fail ', async () => {
        const signers = await ethers.getSigners()
        const keyOwners = signers.slice(2, 7)
        await reverts(
          lock.connect(keyOwner).purchase(
            [],
            keyOwners.map((k) => k.address),
            keyOwners.map(() => web3.utils.padLeft(0, 40)),
            keyOwners.map(() => web3.utils.padLeft(0, 40)),
            [],
            {
              value: (keyPrice * keyOwners.length).toFixed(),
            }
          ),
          'MIGRATION_REQUIRED'
        )
      })
      it('grantKeys should fail ', async () => {
        const signers = await ethers.getSigners()
        const keyOwners = signers.slice(2, 7)
        await reverts(
          lock.connect(keyOwner).grantKeys(
            keyOwners.map((k) => k.address),
            keyOwners.map(() => Date.now()),
            keyOwners.map(() => web3.utils.padLeft(0, 40))
          ),
          'MIGRATION_REQUIRED'
        )
      })
      it('extend should fail ', async () => {
        await reverts(
          lock
            .connect(keyOwner)
            .extend(0, tokenId, web3.utils.padLeft(0, 40), [], {
              value: keyPrice,
            }),
          'MIGRATION_REQUIRED'
        )
      })
    })

    describe('data migration', () => {
      beforeEach(async () => {
        assert.equal(
          totalSupplyBefore.toNumber(),
          (await lock.totalSupply()).toNumber()
        )

        const [, lockOwner] = await ethers.getSigners()
        await lock.connect(lockOwner).migrateKeys(100)
        assert.equal(await lock.ownerOf(tokenId), keyOwner.address)
        assert.equal(await lock.balanceOf(keyOwner), 1)
      })
      it('preserves all data', async () => {
        // assert.equal(await lock.totalSupply(), keyOwner)
        assert.equal(await lock.ownerOf(tokenId), keyOwner.address)
        assert.equal(await lock.balanceOf(keyOwner), 1)
      })
    })
  })
})
