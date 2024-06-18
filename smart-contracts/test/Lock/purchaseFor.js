const assert = require('assert')
const { ethers } = require('hardhat')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')
const {
  getBalance,
  deployLock,
  reverts,
  ADDRESS_ZERO,
  compareBigNumbers,
} = require('../helpers')

const keyPrice = ethers.parseEther('0.01', 'ether')
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
          [await keyOwner.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: ethers.parseEther('0.0001', 'ether'),
          }
        ),
        'INSUFFICIENT_VALUE'
      )
      // Making sure we do not have a key set!
      assert.equal(
        await lock.keyExpirationTimestampFor(await keyOwner.getAddress()),
        0
      )
    })

    it('should fail if we reached the max number of keys', async () => {
      await lockSingleKey.purchase(
        [],
        [await keyOwner.getAddress()],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        ['0x'],
        {
          value: keyPrice,
        }
      )
      await reverts(
        lockSingleKey.purchase(
          [],
          [await anotherKeyOwner.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
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
        [await anotherKeyOwner.getAddress()],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        ['0x'],
        {
          value: keyPrice,
        }
      )
      const receipt = await tx.wait()
      const { args } = await getEvent(receipt, 'Transfer')

      assert.equal(args.from, 0)
      assert.equal(args.to, await anotherKeyOwner.getAddress())

      // Verify that RenewKeyPurchase does not emit on a first key purchase
      const event = await getEvent(receipt, 'RenewKeyPurchase')
      assert.equal(event, null)
    })

    describe('when the user already owns an expired key', () => {
      it('should create a new key', async () => {
        const tx = await anotherLock.purchase(
          [],
          [await keyOwner.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: keyPrice,
          }
        )
        assert.equal(
          await anotherLock.balanceOf(await keyOwner.getAddress()),
          1
        )
        assert.equal(
          await anotherLock.getHasValidKey(await keyOwner.getAddress()),
          true
        )

        // let's now expire the key
        const receipt = await tx.wait()
        const { args } = await getEvent(receipt, 'Transfer')
        await anotherLock.expireAndRefundFor(args.tokenId, 0)
        assert.equal(
          await anotherLock.getHasValidKey(await keyOwner.getAddress()),
          false
        )
        assert.equal(
          await anotherLock.balanceOf(await keyOwner.getAddress()),
          0
        )
        assert.equal(
          await anotherLock.totalKeys(await keyOwner.getAddress()),
          1
        )

        // Purchase a new one
        await anotherLock.purchase(
          [],
          [await keyOwner.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: keyPrice,
          }
        )
        assert.equal(
          await anotherLock.balanceOf(await keyOwner.getAddress()),
          1
        )
        assert.equal(
          await anotherLock.getHasValidKey(await keyOwner.getAddress()),
          true
        )
        assert.equal(
          await anotherLock.totalKeys(await keyOwner.getAddress()),
          2
        )
      })
    })

    describe('when the user already owns a non expired key', () => {
      it('should create a new key', async () => {
        await lock.purchase(
          [],
          [await anotherKeyOwner.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: keyPrice,
          }
        )
        assert.equal(
          await lock.balanceOf(await anotherKeyOwner.getAddress()),
          1
        )
        await lock.purchase(
          [],
          [await anotherKeyOwner.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: keyPrice,
          }
        )
        assert.equal(
          await lock.balanceOf(await anotherKeyOwner.getAddress()),
          2
        )
      })
    })

    describe('when the key was successfuly purchased', () => {
      let totalSupplyBefore
      let numberOfOwnersBefore
      let balanceBefore
      let now
      let tokenId

      beforeEach(async () => {
        balanceBefore = await getBalance(await lock.getAddress())
        totalSupplyBefore = await lock.totalSupply()
        numberOfOwnersBefore = await lock.numberOfOwners()
        const tx = await lock.purchase(
          [],
          [await keyOwner.getAddress()],
          [ADDRESS_ZERO],
          [ADDRESS_ZERO],
          ['0x'],
          {
            value: keyPrice,
          }
        )
        const receipt = await tx.wait()
        const { args, blockNumber } = await getEvent(receipt, 'Transfer')
        tokenId = args.tokenId
        ;({ timestamp: now } = await ethers.provider.getBlock(blockNumber))
      })

      it('should have the right expiration timestamp for the key', async () => {
        const expirationTimestamp =
          await lock.keyExpirationTimestampFor(tokenId)

        const expirationDuration = await lock.expirationDuration()

        assert(expirationTimestamp >= expirationDuration + BigInt(now))
      })

      it('should have added the funds to the contract', async () => {
        compareBigNumbers(
          await getBalance(await lock.getAddress()),
          balanceBefore + keyPrice
        )
      })

      it('should have increased the number of outstanding keys', async () => {
        compareBigNumbers(await lock.totalSupply(), totalSupplyBefore + 1n)
      })

      it('should have increased the number of owners', async () => {
        compareBigNumbers(
          await lock.numberOfOwners(),
          numberOfOwnersBefore + 1n
        )
      })
    })

    it('can purchase a free key', async () => {
      const tx = await lockFree.purchase(
        [],
        [await anotherKeyOwner.getAddress()],
        [ADDRESS_ZERO],
        [ADDRESS_ZERO],
        ['0x']
      )
      const receipt = await tx.wait()
      const { args } = await getEvent(receipt, 'Transfer')
      assert.equal(args.from, 0)
      assert.equal(args.to, await anotherKeyOwner.getAddress())
    })
  })
})
