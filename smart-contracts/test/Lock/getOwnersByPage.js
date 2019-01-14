
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

  describe('getOwnersByPage', () => {
    describe('when there are 0 key owners', () => {
      it('should return an error', () => {
        return locks['FIRST'].getOwnersByPage.call(0, 2, { from: accounts[5] })
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert No keys to retrieve')
          })
      })
    })

    describe('when there are less owners than the page size', () => {
      it('should return all of the key owners', () => {
        return locks['FIRST'].purchaseFor(accounts[1], 'something', {
          value: Units.convert('0.01', 'eth', 'wei')
        }).then((f) => {
          return locks['FIRST'].getOwnersByPage.call(0, 2, { from: accounts[0] })
            .then((result) => {
              assert.equal(result.length, 1)
              assert.include(result, accounts[1])
            })
        })
      })
    })

    describe('when there are more owners than the page size', () => {
      it('return page size number of key owners', () => {
        return locks['FIRST'].purchaseFor(accounts[1], 'something', {
          value: Units.convert('0.01', 'eth', 'wei')
        }).then(() => {
          return locks['FIRST'].purchaseFor(accounts[2], 'something_else', {
            value: Units.convert('0.01', 'eth', 'wei')
          }).then(() => {
            return locks['FIRST'].purchaseFor(accounts[3], 'something_else_2', {
              value: Units.convert('0.01', 'eth', 'wei')
            }).then((f) => {
              return locks['FIRST'].getOwnersByPage.call(0, 2, { from: accounts[0] })
                .then((result) => {
                  assert.equal(result.length, 2)
                  assert.include(result, accounts[1])
                  assert.include(result, accounts[2])
                })
            })
          })
        })
      })
    })

    describe('when requesting a secondary page', () => {
      it('return page size number of key owners', () => {
        return locks['FIRST'].purchaseFor(accounts[1], 'something', {
          value: Units.convert('0.01', 'eth', 'wei')
        }).then(() => {
          return locks['FIRST'].purchaseFor(accounts[2], 'something_else', {
            value: Units.convert('0.01', 'eth', 'wei')
          }).then(() => {
            return locks['FIRST'].purchaseFor(accounts[3], 'something_else_2', {
              value: Units.convert('0.01', 'eth', 'wei')
            }).then((f) => {
              return locks['FIRST'].getOwnersByPage.call(1, 2, { from: accounts[0] })
                .then((result) => {
                  assert.equal(result.length, 1)
                  assert.equal(accounts[3], result[0])
                })
            })
          })
        })
      })
    })
  })
})
