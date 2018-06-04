
const Units = require('ethereumjs-units')

const deployLocks = require('../helpers/deployLocks')
const Unlock = artifacts.require('../Unlock.sol')

let unlock, locks

contract('Lock', (accounts) => {
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

  describe('purchase', () => {
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
        let filter = locks['FIRST'].Transfer((error, { args }) => {
          if (error) {
            assert(false, error)
          }
          assert.equal(args._to, accounts[2])
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

  describe('withdraw', () => {
    let owner
    let price = Units.convert('0.01', 'eth', 'wei')

    before(() => {
      const purchases = [accounts[1], accounts[2]].map((account) => {
        return locks['OWNED'].purchase('', {
          value: price,
          from: account
        })
      })
      return Promise.all(purchases)
        .then(() => {
          return locks['OWNED'].owner.call()
        })
        .then((_owner) => {
          owner = _owner
        })
    })

    it('should only allow the owner to withdraw', () => {
      assert.notEqual(owner, accounts[1]) // Making sure
      return locks['OWNED'].withdraw({
        from: accounts[1]
      }).catch(error => {
        assert.equal(error.message, 'VM Exception while processing transaction: revert')
      })
    })

    describe('when the owner withdraws funds', () => {
      let ownerBalance, lockBalance
      before(() => {
        lockBalance = web3.eth.getBalance(locks['OWNED'].address)
        ownerBalance = web3.eth.getBalance(owner)
        return locks['OWNED'].withdraw({
          from: owner
        })
      })
      it('should increase the owner\'s balance with the funds from the lock', () => {
        assert(web3.eth.getBalance(owner) > ownerBalance)
      })

      it('should set the lock\'s balance to 0', () => {
        assert.equal(web3.eth.getBalance(locks['OWNED'].address), 0)
      })
    })
  })
})
