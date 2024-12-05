const assert = require('assert')
const { ethers, upgrades } = require('hardhat')
const path = require('path')

const {
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
  ADDRESS_ZERO,
  getEvents,
} = require('@unlock-protocol/hardhat-helpers')
const { deployERC20, purchaseKey, increaseTimeTo } = require('../../helpers')

// pass proper root folder to helpers
const dirname = path.join(__dirname, '..')

const keyPrice = ethers.parseEther('0.01')
const previousVersionNumber = 14
const nextVersionNumber = 15

const duration = 60 * 60 * 24 * 30 // 30 days
const currency = ADDRESS_ZERO
const maxKeys = 200
const name = 'A neat upgradeable lock!'

describe('PublicLock upgrade v14 > v15', () => {
  let lock
  let PublicLockLatest
  let PublicLockPast

  after(async () => await cleanupContractVersions(dirname))

  before(async function () {
    // make sure mocha doesnt time out
    this.timeout(200000)

    // get contract versions
    const [pathPublicLockPast] = await copyAndBuildContractsAtVersion(dirname, [
      { contractName: 'PublicLock', version: previousVersionNumber },
    ])

    PublicLockPast = await ethers.getContractFactory(pathPublicLockPast)
    PublicLockLatest = await ethers.getContractFactory(
      'contracts/PublicLock.sol:PublicLock'
    )

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

    // allow many keys
    await lock.connect(lockOwner).updateLockConfig(duration, maxKeys, maxKeys)
  })

  it('past version has correct version number', async () => {
    assert.equal(await lock.publicLockVersion(), previousVersionNumber)
  })

  describe('perform upgrade', async () => {
    let buyers
    let tokenIds
    let expirationTimestamps
    let totalSupplyBefore
    let penaltyBefore, ownerBefore

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

      // using refundPenaltyBasisPoints and convenience owner as they are the lowest var in storage layout
      penaltyBefore = await lock.refundPenaltyBasisPoints()
      ownerBefore = await lock.owner()

      // deploy new implementation
      lock = await upgrades.upgradeProxy(
        await lock.getAddress(),
        PublicLockLatest,
        {
          // UNSECURE - but we need the flag as we are resizing the `__gap`
          unsafeSkipStorageCheck: true,
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
      assert.equal(await lock.keyPrice(), keyPrice)
      assert.equal(await lock.maxNumberOfKeys(), maxKeys)
      assert.equal(await lock.tokenAddress(), currency)
    })

    it('totalSupply is preserved', async () => {
      assert.equal(totalSupplyBefore, await lock.totalSupply())
    })

    it('refund penalty is preserved', async () => {
      assert.equal(penaltyBefore, await lock.refundPenaltyBasisPoints())
    })
    it('owner is preserved', async () => {
      assert.equal(ownerBefore, await lock.owner())
    })

    describe('data migration', () => {
      before(async () => {
        await lock.migrate('0x')
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

  describe('renewal settings', async () => {
    let tokenId
    let deployer, lockOwner, keyOwner
    before(async () => {
      ;[deployer, lockOwner, keyOwner] = await ethers.getSigners()
      const token = await deployERC20(deployer)

      // make it erc20
      await lock
        .connect(lockOwner)
        .updateKeyPricing(await lock.keyPrice(), await token.getAddress())

      // set approval
      const someTokens = ethers.parseEther('100.0')
      await token.mint(await keyOwner.getAddress(), someTokens)
      await token.connect(keyOwner).approve(await lock.getAddress(), someTokens)
      ;({ tokenId } = await purchaseKey(
        lock,
        await keyOwner.getAddress(),
        true
      ))
      const expirationTs = await lock.keyExpirationTimestampFor(tokenId)
      await increaseTimeTo(expirationTs)
      assert(await lock.isRenewable(tokenId, ADDRESS_ZERO))
    })

    it('are preserved during upgrade', async () => {
      // make upgrade
      lock = await upgrades.upgradeProxy(
        await lock.getAddress(),
        PublicLockLatest,
        {
          // UNSECURE - but we need the flag as we are resizing the `__gap`
          unsafeSkipStorageCheck: true,
        }
      )

      // isRenewable
      assert(await lock.isRenewable(tokenId, ADDRESS_ZERO))
    })
  })
})
