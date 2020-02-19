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
  const [keyOwner1, keyOwner2, keyOwner3, evilKeyOwner] = keyOwners
  const keyPrice = new BigNumber(Units.convert(0.01, 'eth', 'wei'))
  const oneDay = new BigNumber(60 * 60 * 24)
  let iD
  let keyManager
  let keyManagerBefore

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
    let keyOwner

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
    it('should not change KM when renewing expired keys', async () => {
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
    it('should set KM == keyOwner for new recipients', async () => {
      await lock.transferFrom(keyOwner1, accounts[9], iD, {
        from: keyOwner1,
      })
      keyManager = await lock.getKeyManagerOf.call(iD)
      assert.equal(keyManager, accounts[9])
    })
    it('should not change KM for existing key owners', async () => {
      let iD9 = await lock.getTokenIdFor(accounts[9])
      iD = await lock.getTokenIdFor(keyOwner2)
      keyManagerBefore = await lock.getKeyManagerOf.call(iD)
      await lock.transferFrom(accounts[9], keyOwner2, iD9, {
        from: accounts[9],
      })
      keyManager = await lock.getKeyManagerOf.call(iD)
      assert.equal(keyManagerBefore, keyManager)
    })
  })
  describe('Key Sharing', () => {
    const ZERO_ADDRESS = web3.utils.padLeft(0, 40)
    it('should let key sharer set an arbitrary KM for Child key', async () => {
      iD = await lock.getTokenIdFor(keyOwner3)
      await lock.shareKey(accounts[8], iD, oneDay, accounts[7], {
        from: keyOwner3,
      })
      iD = await lock.getTokenIdFor(accounts[8])
      keyManager = await lock.getKeyManagerOf(iD)
      assert.equal(keyManager, accounts[7])
    })
    it('should let key sharer set no KM for Child key', async () => {
      iD = await lock.getTokenIdFor(keyOwner3)
      await lock.shareKey(accounts[6], iD, oneDay, ZERO_ADDRESS, {
        from: keyOwner3,
      })
      iD = await lock.getTokenIdFor(accounts[6])
      keyManager = await lock.getKeyManagerOf(iD)
      assert.equal(keyManager, ZERO_ADDRESS)
    })

    // prevent key sharer from taking control of an existing key simply by sharing a small abount of time with it and setting self as KM !
    it('does not allow the key sharer to update the KM for Child key', async () => {
      let hasKey = await lock.getHasValidKey(accounts[6])
      assert.equal(hasKey, true)
      iD = await lock.getTokenIdFor(evilKeyOwner)
      await lock.shareKey(accounts[6], iD, oneDay, evilKeyOwner, {
        from: evilKeyOwner,
      })
      iD = await lock.getTokenIdFor(accounts[6])
      keyManager = await lock.getKeyManagerOf(iD)
      assert.notEqual(keyManager, evilKeyOwner)
    })
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
