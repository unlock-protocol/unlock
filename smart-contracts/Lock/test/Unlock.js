const assert = require('assert')
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

  it('should create locks', () => {
    let lock = locks['FIRST LOCK']
    return Promise.all([
      lock.owner.call(),
      lock.unlockProtocol.call(),
      lock.keyReleaseMechanism.call(),
      lock.expirationDuration.call(),
      lock.expirationTimestamp.call(),
      lock.keyPriceCalculator.call(),
      lock.keyPrice.call(),
      lock.maxNumberOfKeys.call()
    ]).then(([owner, unlockProtocol, keyReleaseMechanism,
      expirationDuration, expirationTimestamp, keyPriceCalculator, keyPrice, maxNumberOfKeys]) => {
      assert.strictEqual(owner, accounts[0])
      assert.strictEqual(unlockProtocol, unlock.address)
      assert.strictEqual(keyReleaseMechanism.toNumber(), 0)
      assert.strictEqual(expirationDuration.toNumber(), 60 * 60 * 24 * 30)
      assert.strictEqual(expirationTimestamp.toNumber(), 0)
      assert.strictEqual(keyPriceCalculator, zeroHex)
      assert.strictEqual(Units.convert(keyPrice.toNumber(), 'wei', 'eth'), '0.01')
      assert.strictEqual(maxNumberOfKeys.toNumber(), 10)
    })
  })

  describe('Lock', () => {
    describe('purchase()', () => {
      describe('if the contract has a private key release', () => {
        it('should fail', () => {
          const lock = locks['PRIVATE LOCK']
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
        it('should fail if the price is not enough')
        it('should fail if we reached the max number of keys')
        it('should fail if the account already owns a key')
        describe('when the key was successfuly purchased', () => {
          let lock

          before(() => {
            lock = locks['FIRST LOCK']
            return lock.purchase('Julien')
          })

          it('should have the right data for the key', () => {
            return lock.keyDataFor(accounts[0]).then(keyData => {
              assert.equal(keyData, 'Julien')
            })
          })

          it('should have the right expiration timestamp for the key', () => {
            const now = parseInt(new Date().getTime() / 1000)
            const lock = locks['FIRST LOCK']
            return Promise.all([
              lock.keyExpirationTimestampFor(accounts[0]),
              lock.expirationDuration()
            ]).then(([expirationTimestamp, expirationDuration]) => {
              assert(expirationTimestamp.toNumber() >= now + expirationDuration.toNumber())
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
