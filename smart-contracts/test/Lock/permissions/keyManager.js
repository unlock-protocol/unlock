const { reverts } = require('truffle-assertions')
const BigNumber = require('bignumber.js')
const Units = require('ethereumjs-units')
const deployLocks = require('../../helpers/deployLocks')
const getProxy = require('../../helpers/proxy')

const unlockContract = artifacts.require('../Unlock.sol')

let unlock
let locks
let lock
let lockCreator

contract('Permissions / KeyManager', accounts => {
  lockCreator = accounts[0]
  const lockManager = lockCreator
  const keyGranter = lockCreator
  const keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]
  const [keyOwner1, keyOwner2, keyOwner3, keyOwner4] = keyOwners
  const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, lockCreator)
    lock = locks.FIRST
  })

  before(async () => {
    const purchases = keyOwners.map(account => {
      return lock.purchase(0, account, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: account,
      })
    })
    await Promise.all(purchases)
  })

  describe('Key Purchases', () => {
    let keyManager
    let keyManagerBefore
    let keyOwner
    let iD
    // KM == KeyManager
    it('should set KM == keyOwner for new purchases', async () => {
      iD = await lock.getTokenIdFor(keyOwner1)
      keyManager = await lock.getKeyManagerOf.call(iD)
      keyOwner = await lock.ownerOf(iD)
      assert.equal(keyManager, keyOwner)
    })
    it('should not change KM when topping-up valid keys', async () => {
      keyManagerBefore = await lock.getKeyManagerOf.call(iD)
      await lock.purchase(0, keyOwner1, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: keyOwner1,
      })
      keyManager = await lock.getKeyManagerOf.call(iD)
      assert.equal(keyManagerBefore, keyManager)
    })
    it('should not change KM when re-newing expired keys', async () => {
      keyManagerBefore = await lock.getKeyManagerOf.call(iD)
      await lock.expireKeyFor(keyOwner1, { from: lockManager })
      await lock.purchase(0, keyOwner1, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: keyOwner1,
      })
      keyManager = await lock.getKeyManagerOf.call(iD)
      assert.equal(keyManagerBefore, keyManager)
    })
  })
  describe('Key Transfers', () => {
    it('should set KM == keyOwner for new recipients', async () => {})
    it('should not change KM for existing key owners', async () => {})
  })
  describe('Key Sharing', () => {
    it('should let key sharer set an arbitrary KM for Child key', async () => {})
    it('should let key sharer set no KM for Child key', async () => {})
  })
  describe('Key Granting', () => {
    it('should let KeyGranter set an arbitrary KM for granted key', async () => {})
    it('should let KeyGranter set no KM for granted key', async () => {})
  })

  describe('updating the key manager', () => {
    it('should allow the current keyManager to set a new KM', async () => {})
    it('should allow a LockManager to set a new KM', async () => {})
  })
})
