const { reverts } = require('truffle-assertions')
const BigNumber = require('bignumber.js')
const deployLocks = require('../../helpers/deployLocks')
const getProxy = require('../../helpers/proxy')
const { ZERO_ADDRESS } = require('hardlydifficult-ethereum-contracts')

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
  const keyOwner5 = accounts[5]
  const keyPrice = new BigNumber(web3.utils.toWei('0.01', 'ether'))
  const oneDay = new BigNumber(60 * 60 * 24)
  const ZERO_ADDRESS = web3.utils.padLeft(0, 40)
  let iD
  let keyManager
  let keyManagerBefore
  let hasKey

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
    it('should leave the KM == 0x00(default) for new purchases', async () => {
      iD = await lock.getTokenIdFor(keyOwner1)
      keyManager = await lock.keyManagerOf.call(iD)
      keyOwner = await lock.ownerOf(iD)
      assert.equal(keyManager, ZERO_ADDRESS)
    })
    it('should not change KM when topping-up valid keys', async () => {
      keyManagerBefore = await lock.keyManagerOf.call(iD)
      await lock.purchase(0, keyOwner1, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: keyOwner1,
      })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManagerBefore, keyManager)
    })
    it('should reset the KM == 0x00 when renewing expired keys', async () => {
      keyManagerBefore = await lock.keyManagerOf.call(iD)
      await lock.expireKeyFor(keyOwner1, { from: lockManager })
      await lock.purchase(0, keyOwner1, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: keyOwner1,
      })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, ZERO_ADDRESS)
    })
  })
  describe('Key Transfers', () => {
    const expirationTimestamp = Math.round(Date.now() / 1000 + 6000000)

    before(async () => {
      await lock.grantKeys([keyOwner5], [expirationTimestamp], [lockCreator], {
        from: lockCreator,
      })
      await lock.purchase(0, accounts[8], web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: accounts[8],
      })
    })

    it('should leave the KM == 0x00(default) for new recipients', async () => {
      iD = await lock.getTokenIdFor(keyOwner1)
      await lock.transferFrom(keyOwner1, accounts[9], iD, {
        from: keyOwner1,
      })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, ZERO_ADDRESS)
    })

    it('should not change KM for existing valid key owners', async () => {
      let iD8 = await lock.getTokenIdFor(accounts[8])
      iD = await lock.getTokenIdFor(keyOwner2)
      keyManagerBefore = await lock.keyManagerOf.call(iD)
      await lock.transferFrom(accounts[8], keyOwner2, iD8, {
        from: accounts[8],
      })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManagerBefore, keyManager)
    })

    it('should reset the KM to 0x00 for expired key owners', async () => {
      iD = await lock.getTokenIdFor(keyOwner5)
      keyManagerBefore = await lock.keyManagerOf.call(iD)
      assert.notEqual(keyManagerBefore, ZERO_ADDRESS)
      await lock.expireAndRefundFor(keyOwner5, 0, { from: lockCreator })
      assert.equal(await lock.getHasValidKey.call(keyOwner5), false)
      iD = await lock.getTokenIdFor(keyOwner2)
      await lock.transferFrom(keyOwner2, keyOwner5, iD, {
        from: keyOwner2,
      })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, ZERO_ADDRESS)
    })
  })

  describe('Key Sharing', () => {
    it('should let key sharer set an arbitrary KM for Child key', async () => {
      iD = await lock.getTokenIdFor(keyOwner3)
      await lock.shareKey(accounts[8], iD, oneDay, accounts[7], {
        from: keyOwner3,
      })
      iD = await lock.getTokenIdFor(accounts[8])
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, accounts[7])
    })
    it('should let key sharer set no KM for Child key', async () => {
      iD = await lock.getTokenIdFor(keyOwner3)
      await lock.shareKey(accounts[6], iD, oneDay, ZERO_ADDRESS, {
        from: keyOwner3,
      })
      iD = await lock.getTokenIdFor(accounts[6])
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, ZERO_ADDRESS)
    })

    // prevent key sharer from taking control of an existing key simply by sharing a small abount of time with it and setting self as KM !
    it('does not allow the key sharer to update the KM for Child key', async () => {
      hasKey = await lock.getHasValidKey(accounts[6])
      assert.equal(hasKey, true)
      iD = await lock.getTokenIdFor(evilKeyOwner)
      await lock.shareKey(accounts[6], iD, oneDay, evilKeyOwner, {
        from: evilKeyOwner,
      })
      iD = await lock.getTokenIdFor(accounts[6])
      keyManager = await lock.keyManagerOf.call(iD)
      assert.notEqual(keyManager, evilKeyOwner)
    })
  })
  describe('Key Granting', () => {
    let validExpirationTimestamp = Math.round(Date.now() / 1000 + 600)

    it('should let KeyGranter set an arbitrary KM for granted key', async () => {
      await lock.grantKeys(
        [accounts[7]],
        [validExpirationTimestamp],
        [accounts[8]],
        {
          from: keyGranter,
        }
      )
      iD = await lock.getTokenIdFor(accounts[7])
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, accounts[8])
    })

    it('should let KeyGranter set no KM for granted key', async () => {
      await lock.grantKeys(
        [accounts[1]],
        [validExpirationTimestamp],
        [ZERO_ADDRESS],
        {
          from: keyGranter,
        }
      )
      iD = await lock.getTokenIdFor(accounts[1])
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, ZERO_ADDRESS)
    })

    it('should not let the keyGranter overwrite the keyManager for valid keys', async () => {
      assert.equal(await lock.getHasValidKey.call(accounts[7]), true)
      const iD = await lock.getTokenIdFor(accounts[7])
      const newTimestamp = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 30)
      const originalKeyManager = await lock.keyManagerOf.call(iD)
      assert.notEqual(originalKeyManager, lockCreator)
      // lockCreator attenpts to set herself as the keyManager
      await lock.grantKeys([accounts[7]], [newTimestamp], [lockCreator], {
        from: lockCreator,
      })
      const newKeyManager = await lock.keyManagerOf.call(iD)
      assert.equal(originalKeyManager, newKeyManager)
    })
  })

  describe('updating the key manager', () => {
    it('should allow the current keyManager to set a new KM', async () => {
      iD = await lock.getTokenIdFor(accounts[7])
      keyManagerBefore = await lock.keyManagerOf.call(iD)
      await lock.setKeyManagerOf(iD, accounts[1], { from: keyManagerBefore })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.notEqual(keyManagerBefore, keyManager)
      assert.equal(keyManager, accounts[1])
    })

    it('should allow a LockManager to set a new KM', async () => {
      iD = await lock.getTokenIdFor(accounts[7])
      keyManagerBefore = await lock.keyManagerOf.call(iD)
      await lock.setKeyManagerOf(iD, accounts[2], { from: lockManager })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.notEqual(keyManagerBefore, keyManager)
      assert.equal(keyManager, accounts[2])
    })

    it('should fail to allow anyone else to set a new KM', async () => {
      await reverts(
        lock.setKeyManagerOf(iD, accounts[2], { from: evilKeyOwner }),
        'SETKEYMANAGEROF_ACCESS_DENIED'
      )
    })
  })
})
