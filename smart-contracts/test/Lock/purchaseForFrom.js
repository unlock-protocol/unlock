const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock / purchaseForFrom', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock, accounts[0])
      })
      .then(_locks => {
        locks = _locks
      })
  })

  describe('if the referrer does not have a key', () => {
    it('should fail', async () => {
      const lock = locks['FIRST']
      await shouldFail(lock
        .purchaseForFrom(accounts[0], accounts[1]), 'KEY_NOT_VALID')
      // Making sure we do not have a key set!
      await shouldFail(lock.keyExpirationTimestampFor.call(accounts[0]), 'NO_SUCH_KEY')
    })
  })

  describe('if the referrer has a key', () => {
    it('should succeed', () => {
      const lock = locks['FIRST']
      return lock.purchaseFor(accounts[0], {
        value: Units.convert('0.01', 'eth', 'wei')
      }).then(() => {
        return lock.purchaseForFrom(accounts[1], accounts[0], {
          value: Units.convert('0.01', 'eth', 'wei')
        })
      })
    })
  })
})
