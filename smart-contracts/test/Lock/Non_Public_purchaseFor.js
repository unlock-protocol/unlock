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
  describe('purchaseFor', () => {
    // from purchaseFor.js, ln#23:
    describe.skip('if the contract has a private key release', () => {
      it('should fail', () => {
        const lock = locks['PRIVATE']
        return lock
          .purchaseFor(accounts[0], 'Julien')
          .catch((error) => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert')
            // Making sure we do not have a key set!
            return lock.keyExpirationTimestampFor(accounts[0])
              .catch(error => {
                assert.equal(error.message, 'VM Exception while processing transaction: revert')
              })
          })
      })
    })
  })
  // from purchaseFor.js, ln#184:
  describe.skip('if the contract has a restricted key release', () => {
    let owner

    before(() => {
      return locks['RESTRICTED'].owner().then((_owner) => {
        owner = _owner
      })
    })

    it('should fail if the sending account was not pre-approved', () => {
      return locks['RESTRICTED']
        .purchaseFor(accounts[1], 'Satoshi', {
          value: Units.convert('0.01', 'eth', 'wei')
        })
        .then(() => {
          assert(false, 'this should fail')
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
        })
    })

    // TODO this test is flaky
    it('should succeed if the sending account was pre-approved', () => {
      return locks['RESTRICTED']
        .approve(accounts[3], accounts[3], {
          from: owner
        })
        .then(() => {
          locks['RESTRICTED'].purchaseFor(accounts[3], 'Szabo', {
            value: Units.convert('0.01', 'eth', 'wei')
          })
        })
        .then(() => {
          return locks['RESTRICTED'].keyDataFor(accounts[3])
        })
        .then(keyData => {
          assert.equal(Web3Utils.toUtf8(keyData), 'Szabo')
        })
    })
  })
})
