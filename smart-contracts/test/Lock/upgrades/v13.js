const { ethers, upgrades } = require('hardhat')
const {
  ADDRESS_ZERO,
  getContractFactoryFromSolFiles,
  cleanupPastContracts,
} = require('../../helpers')

const keyPrice = ethers.utils.parseEther('0.01')
const previousVersionNumber = 12
const nextVersionNumber = 13

const duration = 60 * 60 * 24 * 30 // 30 days
const currency = ADDRESS_ZERO
const price = ethers.utils.parseEther('0.01')
const maxKeys = 20
const name = 'A neat upgradeable lock!'

describe('PublicLock upgrade v12 > v13', () => {
  let lock
  let PublicLockLatest
  let PublicLockPast

  after(async () => await cleanupPastContracts())

  before(async function () {
    // make sure mocha doesnt time out
    this.timeout(200000)

    PublicLockLatest = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )

    // get latest version number
    const publicLockLatest = await PublicLockLatest.deploy()
    await publicLockLatest.deployed()

    // get previous version
    PublicLockPast = await getContractFactoryFromSolFiles(
      'PublicLock',
      previousVersionNumber
    )

    // deploy a simple lock
    const [, lockOwner] = await ethers.getSigners()
    const args = [
      lockOwner.address,
      duration,
      currency,
      keyPrice,
      maxKeys,
      name,
    ]

    lock = await upgrades.deployProxy(PublicLockPast, args)
    await lock.deployed()

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
        buyers.map((keyOwner) => keyOwner.address),
        buyers.map(() => ADDRESS_ZERO),
        buyers.map(() => ADDRESS_ZERO),
        buyers.map(() => []),
        {
          value: keyPrice.mul(buyers.length),
        }
      )
      const { events } = await tx.wait()
      tokenIds = events
        .filter((v) => v.event === 'Transfer')
        .map(({ args }) => args.tokenId)

      expirationTimestamps = await Promise.all(
        tokenIds.map((tokenId) => lock.keyExpirationTimestampFor(tokenId))
      )

      // make sure record is proper before upgrade
      assert.equal(await lock.publicLockVersion(), previousVersionNumber)
      assert.equal(await lock.ownerOf(tokenIds[0]), buyers[0].address)
      assert.equal(await lock.balanceOf(buyers[0].address), 1)

      totalSupplyBefore = await lock.totalSupply()

      // deploy new implementation
      lock = await upgrades.upgradeProxy(lock.address, PublicLockLatest, {
        // UNSECURE - but we need the flag as we are resizing the `__gap`
        // unsafeSkipStorageCheck: true,
      })

      // make sure ownership is preserved
      assert.equal(await lock.ownerOf(tokenIds[0]), buyers[0].address)
    })

    it('upgraded successfully ', async () => {
      assert.equal(await lock.publicLockVersion(), nextVersionNumber)
      assert.equal(await lock.name(), name)
      assert.equal(await lock.expirationDuration(), duration)
      assert.equal((await lock.keyPrice()).toString(), price.toString())
      assert.equal(
        (await lock.maxNumberOfKeys()).toString(),
        maxKeys.toString()
      )
      assert.equal(await lock.tokenAddress(), currency)
    })

    it('totalSupply is preserved', async () => {
      assert.equal(
        totalSupplyBefore.toNumber(),
        (await lock.totalSupply()).toNumber()
      )
    })

    it('schemaVersion is not set correctly before migration', async () => {
      assert.equal(
        (await lock.schemaVersion()).toNumber(),
        previousVersionNumber
      )
    })

    describe('data migration', () => {
      before(async () => {
        await lock.migrate('0x')
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
