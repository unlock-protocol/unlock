const Units = require('ethereumjs-units')
const assert = require('assert')

const Lock = artifacts.require('./Lock.sol')
const zeroHex = '0x0000000000000000000000000000000000000000'

contract('Lock', (accounts) => {
  it('should create a lock', () => Lock.deployed()
    .then(instance => Promise.all([
      instance.beneficiary.call(),
      instance.unlockProtocol.call(),
      instance.keyReleaseMechanism.call(),
      instance.expirationDuration.call(),
      instance.expirationTimestamp.call(),
      instance.keyPriceCalculator.call(),
      instance.keyPrice.call(),
      instance.maxNumberOfKeys.call()
    ]))
    .then(([beneficiary, unlockProtocol, keyReleaseMechanism,
      expirationDuration, expirationTimestamp, keyPriceCalculator, keyPrice, maxNumberOfKeys]) => {
      assert.strictEqual(beneficiary, accounts[0])
      assert.strictEqual(unlockProtocol, zeroHex)
      assert.strictEqual(keyReleaseMechanism.toNumber(), 0)
      assert.strictEqual(expirationDuration.toNumber(), 60 * 60 * 24 * 30)
      assert.strictEqual(expirationTimestamp.toNumber(), 0)
      assert.strictEqual(keyPriceCalculator, zeroHex)
      assert.strictEqual(Units.convert(keyPrice.toNumber(), 'wei', 'eth'), '0.01')
      assert.strictEqual(maxNumberOfKeys.toNumber(), 10)
    }))

  describe('purchase()', () => {
    describe('if the contract has a private key release', () => {
      it('should fail')
    })

    describe('if the contract has a public key release', () => {
      it('should fail if the price is not enough')
      it('should fail if we reached the max number of keys')
      it('should fail if the account already owns a key')
      describe('if the key was successfuly purchased', () => {
        it('should show a key for the account as part of the owners')
        it('should have the right expiration timestamp for the key')
      })
    })

    describe('if the contract has an approved key release', () => {
      it('should fail if the sending account was not pre-approved')
      it('should succeed if the sending account was pre-approved')
    })
  })
})
