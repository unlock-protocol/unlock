const { reverts } = require('truffle-assertions')
const BigNumber = require('bignumber.js')
// const { ZERO_ADDRESS } = require('hardlydifficult-ethereum-contracts')
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
      await lock.expireAndRefundFor(keyOwner1, 0, { from: lockManager })
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

    it.skip('should leave the KM == 0x00(default) for new recipients', async () => {
      iD = await lock.getTokenIdFor(keyOwner1)
      await lock.transferFrom(keyOwner1, accounts[9], iD, {
        from: keyOwner1,
      })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, ZERO_ADDRESS)
    })

    it.skip('should not change KM for existing valid key owners', async () => {
      let iD8 = await lock.getTokenIdFor(accounts[8])
      iD = await lock.getTokenIdFor(keyOwner2)
      keyManagerBefore = await lock.keyManagerOf.call(iD)
      await lock.transferFrom(accounts[8], keyOwner2, iD8, {
        from: accounts[8],
      })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManagerBefore, keyManager)
    })

    it.skip('should reset the KM to 0x00 for expired key owners', async () => {
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
    it.skip('should leave the KM == 0x00(default) for new recipients', async () => {
      iD = await lock.getTokenIdFor(keyOwner3)
      await lock.shareKey(accounts[8], iD, oneDay, {
        from: keyOwner3,
      })
      iD = await lock.getTokenIdFor(accounts[8])
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, ZERO_ADDRESS)
    })
    it.skip('should not change KM for existing valid key owners', async () => {
      iD = await lock.getTokenIdFor(keyOwner3)
      keyManagerBefore = await lock.keyManagerOf.call(iD)
      const iD1 = await lock.getTokenIdFor(keyOwner1)
      await lock.shareKey(keyOwner3, iD1, oneDay, {
        from: keyOwner1,
      })
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManagerBefore, keyManager)
    })

    it.skip('should reset the KM to 0x00 for expired key owners', async () => {
      // ensure keyOwner1 has a valid key
      assert.equal(await lock.getHasValidKey.call(keyOwner1), true)
      const iD1 = await lock.getTokenIdFor.call(keyOwner1)
      // the id is not 0
      assert.notEqual(iD1, 0)
      let keyManager = await lock.keyManagerOf.call(iD1)
      // the KM is 0x00, so owner should be able to manage key
      assert.equal(keyManager, ZERO_ADDRESS)
      // keyOwner1 is the owner of iD1
      const owner = await lock.ownerOf.call(iD1)
      assert.equal(owner, keyOwner1)
      // set KM to other than 0x00
      await lock.setKeyManagerOf(iD1, accounts[9], { from: keyOwner1 })
      keyManager = await lock.keyManagerOf.call(iD1)
      // ensure KM is now accounts[9]
      assert.equal(keyManager, accounts[9])
      // expire the key to prep it for testing
      await lock.expireAndRefundFor(keyOwner1, 0, { from: lockCreator })
      // ensure it is now expired
      assert.equal(await lock.getHasValidKey.call(keyOwner1), false)
      // ensure keyOwner3 has a shareble key
      await lock.purchase(0, keyOwner3, web3.utils.padLeft(0, 40), [], {
        value: keyPrice.toFixed(),
        from: keyOwner3,
      })
      iD = await lock.getTokenIdFor(keyOwner3)
      //
      let tx = await lock.shareKey(keyOwner1, iD, oneDay, {
        from: keyOwner3,
      })
      keyManager = await lock.keyManagerOf.call(iD1)
      console.log(tx.logs[0])
      assert.equal(await lock.getHasValidKey.call(keyOwner1), true)
      assert.equal(keyManager, ZERO_ADDRESS)
    })
  })

  describe('Key Granting', () => {
    let validExpirationTimestamp = Math.round(Date.now() / 1000 + 600)

    it.skip('should let KeyGranter set an arbitrary KM for new keys', async () => {
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

    it.skip('should let KeyGranter set an arbitrary KM for existing valid keys', async () => {
      const newTimestamp = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 30)
      assert.equal(await lock.getHasValidKey.call(accounts[7]), true)
      await lock.grantKeys([accounts[7]], [newTimestamp], [keyGranter], {
        from: keyGranter,
      })
      iD = await lock.getTokenIdFor(accounts[7])
      keyManager = await lock.keyManagerOf.call(iD)
      assert.equal(keyManager, keyGranter)
    })

    it.skip('should let KeyGranter set an arbitrary KM for expired keys', async () => {
      await lock.expireAndRefundFor(accounts[7], 0, { from: lockCreator })
      assert.equal(await lock.getHasValidKey.call(accounts[7]), false)
      const newTimestamp = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 30)
      await lock.grantKeys([accounts[7]], [newTimestamp], [ZERO_ADDRESS], {
        from: lockCreator,
      })
      const newKeyManager = await lock.keyManagerOf.call(iD)
      assert.equal(newKeyManager, ZERO_ADDRESS)
    })
  })

  describe('updating the key manager', () => {
    it('should allow the current keyManager to set a new KM', async () => {
      iD = await lock.getTokenIdFor(accounts[7])
      keyManagerBefore = await lock.keyManagerOf.call(iD)
      // A KM of 0x00 means key owner is the manager
      assert.equal(keyManagerBefore, ZERO_ADDRESS)
      await lock.setKeyManagerOf(iD, accounts[1], { from: accounts[7] })
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
        'SET_KEYMANAGEROF: ACCESS_DENIED'
      )
    })
  })
})
