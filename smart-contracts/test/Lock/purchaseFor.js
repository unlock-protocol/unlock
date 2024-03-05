const { assert } = require('chai')
const { ethers } = require('hardhat')

const {
  getBalance,
  deployLock,
  reverts,
  ADDRESS_ZERO,
  compareBigNumbers,
} = require('../helpers')

const keyPrice = ethers.utils.parseEther('0.01', 'ether')
describe('Lock / purchaseFor', () => {
  let lock
  let anotherLock
  let lockSingleKey
  let lockFree
  let keyOwner, anotherKeyOwner

  beforeEach(async () => {
    ;[, keyOwner, anotherKeyOwner] = await ethers.getSigners()

    lock = await deployLock()
    anotherLock = await deployLock()
    lockSingleKey = await deployLock({ name: 'SINGLE KEY' })
    lockFree = await deployLock({ name: 'FREE' })
  })

  describe('when the contract has a public key release', () => {
    it('should fail if the price is not enough', async () => {
      await reverts(
        lock.purchase(
          [],
          [keyOwner.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: ethers.utils.parseEther('0.0001', 'ether'),
          }
        ),
        'INSUFFICIENT_VALUE'
      )
      // Making sure we do not have a key set!
      assert.equal(await lock.keyExpirationTimestampFor(keyOwner.address), 0)
    })

    it('should fail if we reached the max number of keys', async () => {
      await lockSingleKey.purchase(
        [],
        [keyOwner.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: keyPrice,
        }
      )
      await reverts(
        lockSingleKey.purchase(
          [],
          [anotherKeyOwner.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: keyPrice,
          }
        ),
        'LOCK_SOLD_OUT'
      )
    })

    it('should trigger an event when successful', async () => {
      const tx = await lock.purchase(
        [],
        [anotherKeyOwner.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]],
        {
          value: keyPrice,
        }
      )
      const { events } = await tx.wait()
      const { args } = events.find((v) => v.event === 'Transfer')

      assert.equal(args.from, 0)
      assert.equal(args.to, anotherKeyOwner.address)
      // Verify that RenewKeyPurchase does not emit on a first key purchase
      const includes = events.filter((l) => l.event === 'RenewKeyPurchase')
      assert.equal(includes.length, 0)
    })

    describe('when the user already owns an expired key', () => {
      it('should create a new key', async () => {
        const tx = await anotherLock.purchase(
          [],
          [keyOwner.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: keyPrice,
          }
        )
        assert.equal(await anotherLock.balanceOf(keyOwner.address), 1)
        assert.equal(await anotherLock.getHasValidKey(keyOwner.address), true)

        // let's now expire the key
        const { events } = await tx.wait()
        const { args } = events.find((v) => v.event === 'Transfer')
        await anotherLock.expireAndRefundFor(args.tokenId, 0)
        assert.equal(await anotherLock.getHasValidKey(keyOwner.address), false)
        assert.equal(await anotherLock.balanceOf(keyOwner.address), 0)
        assert.equal(await anotherLock.totalKeys(keyOwner.address), 1)

        // Purchase a new one
        await anotherLock.purchase(
          [],
          [keyOwner.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: keyPrice,
          }
        )
        assert.equal(await anotherLock.balanceOf(keyOwner.address), 1)
        assert.equal(await anotherLock.getHasValidKey(keyOwner.address), true)
        assert.equal(await anotherLock.totalKeys(keyOwner.address), 2)
      })
    })

    describe('when the user already owns a non expired key', () => {
      it('should create a new key', async () => {
        await lock.purchase(
          [],
          [anotherKeyOwner.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: keyPrice,
          }
        )
        assert.equal(await lock.balanceOf(anotherKeyOwner.address), 1)
        await lock.purchase(
          [],
          [anotherKeyOwner.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: keyPrice,
          }
        )
        assert.equal(await lock.balanceOf(anotherKeyOwner.address), 2)
      })
    })

    describe('when the key was successfuly purchased', () => {
      let totalSupplyBefore
      let numberOfOwnersBefore
      let balanceBefore
      let now
      let tokenId

      beforeEach(async () => {
        balanceBefore = await getBalance(lock.address)
        totalSupplyBefore = await lock.totalSupply()
        numberOfOwnersBefore = await lock.numberOfOwners()
        const tx = await lock.purchase(
          [],
          [keyOwner.address],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          [[]],
          {
            value: keyPrice,
          }
        )
        const { events, blockNumber } = await tx.wait()
        const { args } = events.find((v) => v.event === 'Transfer')
        tokenId = args.tokenId
        ;({ timestamp: now } = await ethers.provider.getBlock(blockNumber))
      })

      it('should have the right expiration timestamp for the key', async () => {
        const expirationTimestamp = await lock.keyExpirationTimestampFor(
          tokenId
        )

        const expirationDuration = await lock.expirationDuration()

        assert(expirationTimestamp.gte(expirationDuration.add(now)))
      })

      it('should have added the funds to the contract', async () => {
        compareBigNumbers(
          await getBalance(lock.address),
          balanceBefore.add(keyPrice)
        )
      })

      it('should have increased the number of outstanding keys', async () => {
        compareBigNumbers(await lock.totalSupply(), totalSupplyBefore.add(1))
      })

      it('should have increased the number of owners', async () => {
        compareBigNumbers(
          await lock.numberOfOwners(),
          numberOfOwnersBefore.add(1)
        )
      })
    })

    it('can purchase a free key', async () => {
      const tx = await lockFree.purchase(
        [],
        [anotherKeyOwner.address],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        [[]]
      )
      const { events } = await tx.wait()
      const { args } = events.find((v) => v.event === 'Transfer')
      assert.equal(args.from, 0)
      assert.equal(args.to, anotherKeyOwner.address)
    })
  })
})
