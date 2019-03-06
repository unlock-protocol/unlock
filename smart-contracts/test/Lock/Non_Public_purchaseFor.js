const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')

const deployLocks = require('../helpers/deployLocks')
const shouldFail = require('../helpers/shouldFail')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock / Non_Public_purchaseFor', (accounts) => {
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

  // from purchaseFor.js, ln#23:
  describe.skip('if the contract has a private key release', () => {
    it('should fail', async () => {
      const lock = locks['PRIVATE']
      await shouldFail(lock
        .purchaseFor(accounts[0], Web3Utils.toHex('Julien')), '')
      // Making sure we do not have a key set!
      await shouldFail(lock.keyExpirationTimestampFor.call(accounts[0]), '')
    })
  })

  // from purchaseFor.js, ln#184:
  describe.skip('if the contract has a restricted key release', () => {
    let owner

    before(() => {
      return locks['RESTRICTED'].owner.call().then((_owner) => {
        owner = _owner
      })
    })

    it('should fail if the sending account was not pre-approved', async () => {
      await shouldFail(locks['RESTRICTED']
        .purchaseFor(accounts[1], Web3Utils.toHex('Satoshi'), {
          value: Units.convert('0.01', 'eth', 'wei')
        }), '')
    })

    // TODO this test is flaky
    it('should succeed if the sending account was pre-approved', () => {
      return locks['RESTRICTED']
        .approve(accounts[3], accounts[3], {
          from: owner
        })
        .then(() => {
          locks['RESTRICTED'].purchaseFor(accounts[3], Web3Utils.toHex('Szabo'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
        })
        .then(() => {
          return locks['RESTRICTED'].keyDataFor.call(accounts[3])
        })
        .then(keyData => {
          assert.equal(Web3Utils.toUtf8(keyData), 'Szabo')
        })
    })
  })
})
