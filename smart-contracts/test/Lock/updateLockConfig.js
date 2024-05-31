const { ethers } = require('hardhat')
const assert = require('assert')
const {
  deployLock,
  purchaseKey,
  purchaseKeys,
  reverts,
  compareBigNumbers,
} = require('../helpers')
const { lockFixtures, getEvent } = require('@unlock-protocol/hardhat-helpers')
const { maxNumberOfKeys, expirationDuration } = lockFixtures['NO_MAX_KEYS']
const maxKeysPerAddress = 1

const defaultValues = [expirationDuration, maxNumberOfKeys, maxKeysPerAddress]

describe('Lock / updateLockConfig', () => {
  let lock

  before(async () => {
    lock = await deployLock({ name: 'NO_MAX_KEYS' })
  })

  it('set default values correctly', async () => {
    compareBigNumbers(await lock.maxKeysPerAddress(), maxKeysPerAddress)
    compareBigNumbers(await lock.expirationDuration(), expirationDuration)
    compareBigNumbers(await lock.maxNumberOfKeys(), maxNumberOfKeys)
  })

  it('can only be invoked by lock manager', async () => {
    const [, , rando] = await ethers.getSigners()
    await reverts(
      lock.connect(rando).updateLockConfig(...defaultValues),
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
      assert.equal(await lock.maxKeysPerAddress(), 11)

      await lock.updateLockConfig(
        maxNumberOfKeys,
        expirationDuration,
        1234567890
      )
      compareBigNumbers(await lock.maxKeysPerAddress(), 1234567890)

      await lock.updateLockConfig(expirationDuration, maxNumberOfKeys, 1)
      compareBigNumbers(await lock.maxKeysPerAddress(), 1)
    })
  })

  describe('set expirationDuration', () => {
    it('update the expiration duration of an existing lock', async () => {
      await lock.updateLockConfig(1000, maxNumberOfKeys, maxKeysPerAddress)
      compareBigNumbers(await lock.expirationDuration(), '1000')

      await lock.updateLockConfig(0, maxNumberOfKeys, maxKeysPerAddress)
      compareBigNumbers(await lock.expirationDuration(), '0')
    })
  })

  describe('set maxNumberofKeys', () => {
    it('update the expiration duration of an existing lock', async () => {
      await lock.updateLockConfig(expirationDuration, 20, maxKeysPerAddress)
      compareBigNumbers(await lock.maxNumberOfKeys(), 20)

      await lock.updateLockConfig(expirationDuration, 201, maxKeysPerAddress)
      compareBigNumbers(await lock.maxNumberOfKeys(), 201)
    })
    it('should allow setting a value lower than total supply', async () => {
      // buy 10 keys
      await purchaseKeys(lock, 10)

      await lock.updateLockConfig(expirationDuration, 0, maxKeysPerAddress)
      compareBigNumbers(await lock.maxNumberOfKeys(), 0)
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
      compareBigNumbers(await lock.maxNumberOfKeys(), totalSupply)

      // try to buy another key exceding totalSupply
      await reverts(
        purchaseKey(lock, await buyers[11].getAddress()),
        'LOCK_SOLD_OUT'
      )
    })
  })

  describe('emit correct event', () => {
    it('update the expiration duration of an existing lock', async () => {
      const tx = await lock.updateLockConfig(10, 20, 30)

      const receipt = await tx.wait()
      const { args } = await getEvent(receipt, 'LockConfig')

      assert.equal(args.expirationDuration, 10)
      assert.equal(args.maxNumberOfKeys, 20)
      assert.equal(args.maxKeysPerAcccount, 30)
    })
  })
})
