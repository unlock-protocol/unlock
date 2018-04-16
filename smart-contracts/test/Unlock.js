const Units = require('ethereumjs-units')

const deployLocks = require('./helpers/deployLocks')
const Unlock = artifacts.require('./Unlock.sol')
const zeroHex = '0x0000000000000000000000000000000000000000'

contract('Unlock', (accounts) => {
  let unlock, locks

  // Let's build the locks
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

  it('should have created locks', () => {
    const lock = locks['FIRST']
    return Promise.all([
      lock.owner.call(),
      lock.unlockProtocol.call(),
      lock.keyReleaseMechanism.call(),
      lock.expirationDuration.call(),
      lock.expirationTimestamp.call(),
      lock.keyPriceCalculator.call(),
      lock.keyPrice.call(),
      lock.maxNumberOfKeys.call(),
      lock.outstandingKeys.call()
    ]).then(
      ([
        owner,
        unlockProtocol,
        keyReleaseMechanism,
        expirationDuration,
        expirationTimestamp,
        keyPriceCalculator,
        keyPrice,
        maxNumberOfKeys,
        outstandingKeys
      ]) => {
        assert.strictEqual(owner, accounts[0])
        assert.strictEqual(unlockProtocol, unlock.address)
        assert.strictEqual(keyReleaseMechanism.toNumber(), 0)
        assert.strictEqual(
          expirationDuration.toNumber(),
          60 * 60 * 24 * 30
        )
        assert.strictEqual(expirationTimestamp.toNumber(), 0)
        assert.strictEqual(keyPriceCalculator, zeroHex)
        assert.strictEqual(
          Units.convert(keyPrice.toNumber(), 'wei', 'eth'),
          '0.01'
        )
        assert.strictEqual(maxNumberOfKeys.toNumber(), 10)
        assert.strictEqual(outstandingKeys.toNumber(), 0)
      }
    )
  })

  describe('Lock', () => {
    describe('purchase()', () => {
      describe('if the contract has a private key release', () => {
        it('should fail', () => {
          const lock = locks['PRIVATE']
          return lock
            .purchase('Julien')
            .catch((error) => {
              assert.equal(error.message, 'VM Exception while processing transaction: revert')
              // Making sure we do not have a key set!
              return lock.keyExpirationTimestampFor(accounts[0])
            })
            .then(expirationTimestamp => {
              assert.equal(expirationTimestamp.toNumber(), 0)
            })
        })
      })

      describe('when the contract has a public key release', () => {
        it('should fail if the price is not enough', () => {
          return locks['FIRST']
            .purchase('Julien', {
              value: Units.convert('0.0001', 'eth', 'wei')
            })
            .catch(error => {
              assert.equal(error.message, 'VM Exception while processing transaction: revert')
              // Making sure we do not have a key set!
              return locks['FIRST'].keyExpirationTimestampFor(accounts[0])
            })
            .then(expirationTimestamp => {
              assert.equal(expirationTimestamp.toNumber(), 0)
            })
        })

        it('should fail if we reached the max number of keys', () => {
          return locks['SINGLE KEY']
            .purchase('Julien', {
              value: Units.convert('0.01', 'eth', 'wei')
            })
            .then(keyData => {
              return locks['SINGLE KEY'].keyDataFor(accounts[0])
            })
            .then(keyData => {
              assert.equal(keyData, 'Julien')
              return locks['SINGLE KEY'].purchase('Satoshi', {
                value: Units.convert('0.01', 'eth', 'wei'),
                from: accounts[1]
              })
            })
            .catch(error => {
              assert.equal(error.message, 'VM Exception while processing transaction: revert')
              return Promise.all([
                locks['SINGLE KEY'].keyDataFor(accounts[0]),
                locks['SINGLE KEY'].keyDataFor(accounts[1])
              ])
            })
            .then(([keyDataFirst, keyDataSecond]) => {
              assert.equal(keyDataFirst, 'Julien')
              assert.equal(keyDataSecond, '') // No data, since there is no key.
            })
        })

        it('should succeed if the account already owns a key but this key has expired')

        it('should trigger an event when successful', () => {
          let filter = locks['FIRST'].SoldKey((error, { args }) => {
            if (error) {
              assert(false, error)
            }
            assert.equal(args.owner, accounts[2])
            filter.stopWatching()
          })
          return locks['FIRST']
            .purchase('Vitalik', {
              value: Units.convert('0.01', 'eth', 'wei'),
              from: accounts[2]
            })
        })

        it('should fail if the account already owns a key', () => {
          return locks['FIRST']
            .purchase('Satoshi', {
              value: Units.convert('0.01', 'eth', 'wei'),
              from: accounts[1]
            })
            .then(keyData => {
              return locks['FIRST'].keyDataFor(accounts[1])
            })
            .then(keyData => {
              assert.equal(keyData, 'Satoshi')
              return locks['FIRST'].purchase('Satoshi', {
                value: Units.convert('0.01', 'eth', 'wei'),
                from: accounts[1]
              })
            })
            .catch(error => {
              assert.equal(error.message, 'VM Exception while processing transaction: revert')
              return locks['FIRST'].keyDataFor(accounts[1])
            })
            .then(keyData => {
              assert.equal(keyData, 'Satoshi')
            })
        })

        describe('when the key was successfuly purchased', () => {
          let outstandingKeys, balance, now

          before(() => {
            balance = web3.eth.getBalance(locks['FIRST'].address)
            return locks['FIRST'].outstandingKeys.call()
              .then(_outstandingKeys => {
                outstandingKeys = parseInt(_outstandingKeys)
                now = parseInt(new Date().getTime() / 1000)
                return locks['FIRST'].purchase('Julien', {
                  value: Units.convert('0.01', 'eth', 'wei')
                })
              })
          })

          it('should have the right data for the key', () => {
            return locks['FIRST']
              .keyDataFor(accounts[0])
              .then(keyData => {
                assert.equal(keyData, 'Julien')
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

      describe('if the contract has an approved key release', () => {
        it('should fail if the sending account was not pre-approved')
        it('should succeed if the sending account was pre-approved')
      })
    })
  })
})
