const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

const PublicLock = artifacts.require('../../PublicLock.sol')
const getProxy = require('../helpers/proxy')

const unlockContract = artifacts.require('../Unlock.sol')

let unlock

contract('Lock / createLockWithInfiniteKeys', () => {
  before(async function() {
    unlock = await getProxy(unlockContract)
  })

  describe('Create a Lock with infinite keys', function() {
    let transaction
    before(async function() {
      transaction = await unlock.createLock(
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        Web3Utils.padLeft(0, 40),
        Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
        -1, // maxNumberOfKeys
        'Infinite Keys Lock'
      )
    })

    it('should have created the lock with an infinite number of keys', async function() {
      let publicLock = await PublicLock.at(
        transaction.logs[1].args.newLockAddress
      )
      const maxNumberOfKeys = new BigNumber(await publicLock.maxNumberOfKeys())
      assert.equal(
        maxNumberOfKeys.toFixed(),
        new BigNumber(2)
          .pow(256)
          .minus(1)
          .toFixed()
      )
    })
  })

  describe('Create a Lock with 0 keys', function() {
    let transaction
    before(async function() {
      transaction = await unlock.createLock(
        60 * 60 * 24 * 30, // expirationDuration: 30 days
        Web3Utils.padLeft(0, 40),
        Units.convert(1, 'eth', 'wei'), // keyPrice: in wei
        0, // maxNumberOfKeys
        'Zero-Key Lock'
      )
    })

    it('should have created the lock with 0 keys', async function() {
      let publicLock = await PublicLock.at(
        transaction.logs[1].args.newLockAddress
      )
      const maxNumberOfKeys = new BigNumber(await publicLock.maxNumberOfKeys())
      assert.equal(maxNumberOfKeys.toFixed(), 0)
    })
  })
})
