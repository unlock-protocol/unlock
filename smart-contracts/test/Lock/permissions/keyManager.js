const { reverts } = require('truffle-assertions')
const deployLocks = require('../../helpers/deployLocks')
const getProxy = require('../../helpers/proxy')

const unlockContract = artifacts.require('../Unlock.sol')

let lockCreator
const LockManager = lockCreator
const KeyGranter = lockCreator

contract('Permissions / KeyManager', accounts => {
  lockCreator = accounts[0]

  before(async () => {
    unlock = await getProxy(unlockContract)
    locks = await deployLocks(unlock, lockCreator)
    lock = locks.FIRST
  })

  describe('Key Purchases', () => {
    // KM == KeyManager
    it('should set KM == keyOwner for new purchases', async () => {})
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
