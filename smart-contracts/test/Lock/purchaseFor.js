const Units = require('ethereumjs-units')
const Web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')

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
          .purchaseFor(accounts[0], Web3Utils.toHex('Julien'), {
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
          .purchaseFor(accounts[0], Web3Utils.toHex('Julien'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
          .then(keyData => {
            return locks['SINGLE KEY'].keyDataFor(accounts[0])
          })
          .then(keyData => {
            assert.equal(Web3Utils.toUtf8(keyData), 'Julien')
            return locks['SINGLE KEY'].purchaseFor(accounts[1], Web3Utils.toHex('Satoshi'), {
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
          .purchaseFor(accounts[2], Web3Utils.toHex('Vitalik'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
      })

      describe('when the user already owns an expired key', () => {
        it('should expand the validity by the default key duration', async () => {
          await locks['SECOND'].purchaseFor(accounts[4], Web3Utils.toHex('Satoshi'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
          // let's now expire the key
          await locks['SECOND'].expireKeyFor(accounts[4])
          // Purchase a new one
          await locks['SECOND'].purchaseFor(accounts[4], Web3Utils.toHex('Satoshi'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
          // And check the expiration which shiuld be exactly now + keyDuration
          const expirationTimestamp = new BigNumber(await locks['SECOND'].keyExpirationTimestampFor(accounts[4]))
          const now = parseInt(new Date().getTime() / 1000)
          // we check +/- 10 seconds to fix for now being different inside the EVM and here... :(
          assert(expirationTimestamp.gt(locks['SECOND'].params.expirationDuration + now - 10))
          assert(expirationTimestamp.lt(locks['SECOND'].params.expirationDuration + now + 10))
        })
      })

      describe('when the user already owns a non expired key', () => {
        it('should expand the validity by the default key duration', async () => {
          await locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('Satoshi'), {
            value: Units.convert('0.01', 'eth', 'wei')
          })
          const firstKeyData = await locks['FIRST'].keyDataFor(accounts[1])
          assert.equal(Web3Utils.toUtf8(firstKeyData), 'Satoshi')
          const firstExpiration = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[1]))
          assert(firstExpiration.gt(0))
          await locks['FIRST'].purchaseFor(accounts[1], Web3Utils.toHex('Szabo'), {
              value: Units.convert('0.01', 'eth', 'wei')
            })
          const keyData = await locks['FIRST'].keyDataFor(accounts[1])
          assert.equal(Web3Utils.toUtf8(keyData), 'Szabo')
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[1]))
          assert.equal(expirationTimestamp.toFixed(), firstExpiration.plus(locks['FIRST'].params.expirationDuration).toFixed())
        })
      })

      describe('when the key was successfuly purchased', () => {
        let outstandingKeys, numberOfOwners, balance, now

        before(() => {
          balance = web3.eth.getBalance(locks['FIRST'].address)
          return locks['FIRST'].outstandingKeys()
            .then(_outstandingKeys => {
              outstandingKeys = parseInt(_outstandingKeys)
              now = parseInt(new Date().getTime() / 1000)
              return locks['FIRST'].numberOfOwners()
                .then(_numberOfOwners => {
                  numberOfOwners = parseInt(_numberOfOwners)
                  return locks['FIRST'].purchaseFor(accounts[0], Web3Utils.toHex('Julien'), {
                    value: Units.convert('0.01', 'eth', 'wei')
                  })
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

        it('should have the right expiration timestamp for the key', async () => {
          const expirationTimestamp = new BigNumber(await locks['FIRST'].keyExpirationTimestampFor(accounts[0]))
          const expirationDuration = new BigNumber(await locks['FIRST'].expirationDuration())
          assert(expirationTimestamp.gte(expirationDuration.plus(now)))
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

        it('should have increased the number of owners', () => {
          return locks['FIRST'].numberOfOwners
            .call()
            .then(_numberOfOwners => {
              assert.equal(
                parseInt(_numberOfOwners),
                numberOfOwners + 1
              )
            })
        })
      })
    })
  })
})
