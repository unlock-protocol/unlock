
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
    describe('when the contract has a public key release', () => {
      it('should fail if the price is not enough', () => {
        return locks['FIRST']
          .purchaseFor(accounts[0], 'Julien', {
            value: Units.convert('0.0001', 'eth', 'wei')
          })
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert Insufficient funds')
            // Making sure we do not have a key set!
            return locks['FIRST'].keyExpirationTimestampFor(accounts[0])
              .catch(error => {
                assert.equal(error.message, 'VM Exception while processing transaction: revert No such key')
              })
          })
      })

      it('should fail if we reached the max number of keys', () => {
        return locks['SINGLE KEY']
          .purchaseFor(accounts[0], 'Julien', {
            value: Units.convert('0.01', 'eth', 'wei')
          })
          .then(keyData => {
            return locks['SINGLE KEY'].keyDataFor(accounts[0])
          })
          .then(keyData => {
            assert.equal(Web3Utils.toUtf8(keyData), 'Julien')
            return locks['SINGLE KEY'].purchaseFor(accounts[1], 'Satoshi', {
              value: Units.convert('0.01', 'eth', 'wei'),
              from: accounts[1]
            })
          })
          .catch(error => {
            assert.equal(error.message, 'VM Exception while processing transaction: revert Maximum number of keys already sold')
            return locks['SINGLE KEY'].keyDataFor(accounts[1])
              .catch(error => {
                assert.equal(error.message, 'VM Exception while processing transaction: revert No such key')
              })
          })
      })

      it('should trigger an event when successful', () => {
        let filter = locks['FIRST'].Transfer((error, { args }) => {
          if (error) {
            assert(false, error)
          }
          assert.equal(args._to, accounts[2])
          filter.stopWatching()
        })
        return locks['FIRST']
          .purchaseFor(accounts[2], 'Vitalik', {
            value: Units.convert('0.01', 'eth', 'wei')
          })
      })

      describe('when the user already owns an expired key', () => {
        it('should expand the validity by the default key duration', () => {
          return locks['SECOND'].purchaseFor(accounts[4], 'Satoshi', {
            value: Units.convert('0.01', 'eth', 'wei')
          }).then(() => {
            // let's now expire the key
            return locks['SECOND'].expireKeyFor(accounts[4])
          }).then(() => {
            // Purchase a new one
            return locks['SECOND'].purchaseFor(accounts[4], 'Satoshi', {
              value: Units.convert('0.01', 'eth', 'wei')
            })
          }).then(() => {
            // And check the expiration which shiuld be exactly now + keyDuration
            return locks['SECOND'].keyExpirationTimestampFor(accounts[4])
          }).then((expirationTimestamp) => {
            const now = parseInt(new Date().getTime() / 1000)
            // we check +/- 10 seconds to fix for now being different inside the EVM and here... :(
            assert(expirationTimestamp.toNumber() > now + locks['SECOND'].params.expirationDuration - 10)
            assert(expirationTimestamp.toNumber() < now + locks['SECOND'].params.expirationDuration + 10)
          })
        })
      })

      describe('when the user already owns a non expired key', () => {
        it('should expand the validity by the default key duration', () => {
          let firstExpiration
          return locks['FIRST'].purchaseFor(accounts[1], 'Satoshi', {
            value: Units.convert('0.01', 'eth', 'wei')
          })
            .then(() => {
              return Promise.all([
                locks['FIRST'].keyDataFor(accounts[1]),
                locks['FIRST'].keyExpirationTimestampFor(accounts[1])
              ])
            })
            .then(([keyData, expirationTimestamp]) => {
              assert.equal(Web3Utils.toUtf8(keyData), 'Satoshi')
              firstExpiration = expirationTimestamp.toNumber()
              assert(firstExpiration > 0)
              return locks['FIRST'].purchaseFor(accounts[1], 'Szabo', {
                value: Units.convert('0.01', 'eth', 'wei')
              })
            })
            .then(() => {
              return Promise.all([
                locks['FIRST'].keyDataFor(accounts[1]),
                locks['FIRST'].keyExpirationTimestampFor(accounts[1])
              ])
            })
            .then(([keyData, expirationTimestamp]) => {
              assert.equal(Web3Utils.toUtf8(keyData), 'Szabo')
              assert.equal(expirationTimestamp.toNumber(), firstExpiration + locks['FIRST'].params.expirationDuration)
            })
        })
      })

      describe('when the key was successfuly purchased', () => {
        let outstandingKeys, balance, now

        before(() => {
          balance = web3.eth.getBalance(locks['FIRST'].address)
          return locks['FIRST'].outstandingKeys()
            .then(_outstandingKeys => {
              outstandingKeys = parseInt(_outstandingKeys)
              now = parseInt(new Date().getTime() / 1000)
              return locks['FIRST'].purchaseFor(accounts[0], 'Julien', {
                value: Units.convert('0.01', 'eth', 'wei')
              })
            })
        })

        it('should have the right data for the key', () => {
          return locks['FIRST']
            .keyDataFor(accounts[0])
            .then(keyData => {
              assert.equal(Web3Utils.toUtf8(keyData), 'Julien')
            })
        })

        it('should have the right expiration timestamp for the key', () => {
          return Promise.all([
            locks['FIRST'].keyExpirationTimestampFor(accounts[0]),
            locks['FIRST'].expirationDuration()
          ]).then(([expirationTimestamp, expirationDuration]) => {
            assert.isAtLeast(expirationTimestamp.toNumber(), now + expirationDuration.toNumber())
          })
        })

        it('should have added the funds to the contract', () => {
          let newBalance = web3.eth.getBalance(locks['FIRST'].address)
          assert.equal(parseFloat(Units.convert(newBalance, 'wei', 'eth')), parseFloat(Units.convert(balance, 'wei', 'eth')) + 0.01)
        })

        it('should have increased the number of outstanding keys', () => {
          return locks['FIRST'].outstandingKeys
            .call()
            .then(_outstandingKeys => {
              assert.equal(
                parseInt(_outstandingKeys),
                outstandingKeys + 1
              )
            })
        })
      })
    })
  })
})
