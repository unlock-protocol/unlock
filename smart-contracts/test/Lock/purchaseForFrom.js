
const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', (accounts) => {
  before(() => {
    return Unlock.deployed()
      .then(_unlock => {
        unlock = _unlock
        return deployLocks(unlock)
      })
      .then(_locks => {
        locks = _locks
      })
  })

  describe('purchaseForFrom', () => {
    describe('if the referrer does not have a key', () => {
      it('should fail', () => {
        const lock = locks['FIRST']
        return lock
          .purchaseForFrom(accounts[0], accounts[1], 'Julien')
          .catch((error) => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert Key is not valid')
            // Making sure we do not have a key set!
            return lock.keyExpirationTimestampFor(accounts[0])
              .catch(error => {
                assert.equal(error.message, 'VM Exception while processing transaction: revert No such key')
              })
          })
      })
    })

    describe('if the referrer has a key', () => {
      it('should succeed', () => {
        const lock = locks['FIRST']
        return lock.purchaseFor(accounts[0], 'Julien', {
          value: Units.convert('0.01', 'eth', 'wei')
        }).then(() => {
          return lock.keyDataFor(accounts[0])
        }).then((keyData) => {
          assert.equal(Web3Utils.toUtf8(keyData), 'Julien')
          return lock.purchaseForFrom(accounts[1], accounts[0], 'Vitalik', {
            value: Units.convert('0.01', 'eth', 'wei')
          })
        }).then(() => {
          return lock.keyDataFor(accounts[1])
        }).then((keyData) => {
          assert.equal(Web3Utils.toUtf8(keyData), 'Vitalik')
        })
      })
    })
  })
})
