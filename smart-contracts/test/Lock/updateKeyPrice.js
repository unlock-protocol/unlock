const Units = require('ethereumjs-units')

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
      .then(() => {
        // Increases the price from the default 0.01, 'eth'.
        locks['FIRST'].updateKeyPrice(Units.convert('0.1', 'eth', 'wei'))
      })
  })

  describe('updateKeyPrice', () => {
    it('should fail if the price is not enough', () => {
      return locks['FIRST']
        .purchaseFor(accounts[0], 'Julien', {
          value: Units.convert('0.01', 'eth', 'wei')
        })
        .then(() => {
          assert.fail()
        })
        .catch(error => {
          assert.equal(error.message, 'VM Exception while processing transaction: revert')
          // Making sure we do not have a key set!
          return locks['FIRST'].keyExpirationTimestampFor(accounts[0])
            .catch(error => {
              assert.equal(error.message, 'VM Exception while processing transaction: revert')
            })
        })
    })

    it('should purchase when the correct amount of ETH is sent', () => {
      return locks['FIRST']
        .purchaseFor(accounts[0], 'Julien', {
          value: Units.convert('0.1', 'eth', 'wei')
        })
    })
  })
})
