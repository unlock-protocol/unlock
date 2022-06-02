const { ethers, upgrades } = require('hardhat')
const {
  getContractFactoryAtVersion,
  cleanupPastContracts,
} = require('../../helpers/versions')

const keyPrice = ethers.utils.parseEther('0.01')

describe('PublicLock upgrade v10 > v11', () => {
  let lock
  let PublicLockLatest
  let PublicLockPast
  let previousVersionNumber

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

    // getr previous version
    previousVersionNumber = (await publicLockLatest.publicLockVersion()) - 1
    PublicLockPast = await getContractFactoryAtVersion(
      'PublicLock',
      previousVersionNumber
    )

    // deploy a simple lock
    const [, lockOwner] = await ethers.getSigners()
    const args = [
      lockOwner.address,
      60 * 60 * 24 * 30, // 30 days
      ethers.constants.AddressZero,
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

    before(async () => {
      // buy some keys
      const signers = await ethers.getSigners()
      buyers = signers.slice(1, 11)

      // purchase many keys
      const tx = await lock.purchase(
        [],
        buyers.map((keyOwner) => keyOwner.address),
        buyers.map(() => web3.utils.padLeft(0, 40)),
        buyers.map(() => web3.utils.padLeft(0, 40)),
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
        unsafeSkipStorageCheck: true, // UNSECURE - but we need the flag as we are resizing the `__gap`
      })

      // make sure ownership is preserved
      assert.equal(await lock.ownerOf(tokenIds[0]), buyers[0].address)

      // set many keys
      const [, lockOwner] = await ethers.getSigners()
      await lock.connect(lockOwner).setMaxKeysPerAddress(10)
    })

    it('upgraded successfully ', async () => {
      assert.equal(await lock.publicLockVersion(), 11)
    })

    it('totalSupply is preserved', async () => {
      assert.equal(
        totalSupplyBefore.toNumber(),
        (await lock.totalSupply()).toNumber()
      )
    })

    it('schemaVersion is not set correctly before migration', async () => {
      assert.equal((await lock.schemaVersion()).toNumber(), 10)
    })

    describe('data migration', () => {
      before(async () => {
        const [, lockOwner] = await ethers.getSigners()
        await lock.connect(lockOwner).migrate([])
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
          buyers.map(() => web3.utils.padLeft(0, 40)),
          buyers.map(() => web3.utils.padLeft(0, 40)),
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
          buyers.map(() => web3.utils.padLeft(0, 40))
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
