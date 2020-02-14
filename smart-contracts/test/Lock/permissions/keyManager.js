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
  const LockManager = lockCreator
  const KeyGranter = lockCreator
  const keyOwners = [accounts[1], accounts[2], accounts[3], accounts[4]]
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
    // KM == KeyManager
    it('should set KM == keyOwner for new purchases', async () => {
      // await
    })
    it('should not change KM when topping-up valid keys', async () => {})
    it('should not change KM when re-newing expired keys', async () => {})
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
