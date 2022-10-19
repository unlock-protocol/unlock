const { ethers } = require('hardhat')
const { assert } = require('chai')
const Locks = require('../fixtures/locks')
const { deployLock, purchaseKey, purchaseKeys, reverts } = require('../helpers')

const { maxNumberOfKeys, expirationDuration } = Locks['NO_MAX_KEYS']
const maxKeysPerAddress = 1

const defaultValues = [expirationDuration, maxNumberOfKeys, maxKeysPerAddress]

contract('Lock / updateLockConfig', (accounts) => {
  let lock

  before(async () => {
    lock = await deployLock({ name: 'NO_MAX_KEYS' })
  })

  it('set default values correctly', async () => {
    assert.equal((await lock.maxKeysPerAddress()).toNumber(), maxKeysPerAddress)
    assert.equal(
      (await lock.expirationDuration()).toString(),
      expirationDuration
    )
    assert.equal(await lock.maxNumberOfKeys(), maxNumberOfKeys)
  })

  it('can only be invoked by lock manager', async () => {
    await reverts(
      lock.updateLockConfig(...defaultValues, {
        from: accounts[5],
      }),
      'ONLY_LOCK_MANAGER'
    )
  })

  describe('set maxKeysPerAddress', () => {
    it('could not be set to zero', async () => {
      await reverts(
        lock.updateLockConfig(expirationDuration, maxNumberOfKeys, 0),
        'NULL_VALUE'
      )
    })

    it('update the maxKeysPerAddress correctly', async () => {
      await lock.updateLockConfig(expirationDuration, maxNumberOfKeys, 11)
      assert.equal((await lock.maxKeysPerAddress()).toNumber(), 11)

      await lock.updateLockConfig(
        maxNumberOfKeys,
        expirationDuration,
        1234567890
      )
      assert.equal((await lock.maxKeysPerAddress()).toNumber(), 1234567890)

      await lock.updateLockConfig(expirationDuration, maxNumberOfKeys, 1)
      assert.equal((await lock.maxKeysPerAddress()).toNumber(), 1)
    })
  })

  describe('set expirationDuration', () => {
    it('update the expiration duration of an existing lock', async () => {
      await lock.updateLockConfig(1000, maxNumberOfKeys, maxKeysPerAddress)
      expect((await lock.expirationDuration()).toString()).to.be.equal('1000')

      await lock.updateLockConfig(0, maxNumberOfKeys, maxKeysPerAddress)
      expect((await lock.expirationDuration()).toString()).to.be.equal('0')
    })
  })

  describe('set maxNumberofKeys', () => {
    it('update the expiration duration of an existing lock', async () => {
      await lock.updateLockConfig(expirationDuration, 20, maxKeysPerAddress)
      expect((await lock.maxNumberOfKeys()).toNumber()).to.be.equal(20)

      await lock.updateLockConfig(expirationDuration, 201, maxKeysPerAddress)
      expect((await lock.maxNumberOfKeys()).toNumber()).to.be.equal(201)
    })
    it('should prevent from setting a value lower than total supply', async () => {
      // buy 10 keys
      await purchaseKeys(lock, 10)

      // increase supply
      await reverts(
        lock.updateLockConfig(expirationDuration, 5, maxKeysPerAddress),
        'SMALLER_THAN_SUPPLY'
      )
    })
    it('should allow setting a value equal to current total supply', async () => {
      // redeploy lock
      lock = await deployLock()

      // buy 10 keys
      const [, ...buyers] = await ethers.getSigners()
      await purchaseKeys(lock, 10)

      // set max keys to total supply
      const totalSupply = await lock.totalSupply()
      await lock.updateLockConfig(
        await lock.expirationDuration(),
        totalSupply,
        await lock.maxKeysPerAddress()
      )
      assert.equal(
        (await lock.maxNumberOfKeys()).toString(),
        totalSupply.toString()
      )

      // try to buy another key exceding totalSupply
      await reverts(purchaseKey(lock, buyers[11].address), 'LOCK_SOLD_OUT')
    })
  })

  describe('emit correct event', () => {
    it('update the expiration duration of an existing lock', async () => {
      const tx = await lock.updateLockConfig(10, 20, 30)
      const { args } = tx.logs.find(({ event }) => event === 'LockConfig')

      expect(args.expirationDuration.toNumber()).to.be.equal(10)
      expect(args.maxNumberOfKeys.toNumber()).to.be.equal(20)
      expect(args.maxKeysPerAcccount.toNumber()).to.be.equal(30)
    })
  })
})
