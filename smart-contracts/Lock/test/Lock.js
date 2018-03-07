const Units = require("ethereumjs-units")

const Lock = artifacts.require("./Lock.sol")

const zeroHex = "0x0000000000000000000000000000000000000000"

contract("Lock", function(accounts) {
  it("should create a lock", function() {
    return Lock.deployed()
      .then((instance) => {
        return Promise.all([
          instance.beneficiary.call(),
          instance.unlockProtocol.call(),
          instance.keyReleaseMechanism.call(),
          instance.expirationDuration.call(),
          instance.expirationTimestamp.call(),
          instance.keyPriceCalculator.call(),
          instance.keyPrice.call(),
          instance.maxNumberOfKeys.call(),
        ])
      })
      .then(([beneficiary, unlockProtocol, keyReleaseMechanism, expirationDuration, expirationTimestamp, keyPriceCalculator, keyPrice, maxNumberOfKeys]) => {
        assert.strictEqual(beneficiary, accounts[0])
        assert.strictEqual(unlockProtocol, zeroHex)
        assert.strictEqual(keyReleaseMechanism.toNumber(), 0)
        assert.strictEqual(expirationDuration.toNumber(), 60 * 60 * 24 * 30, )
        assert.strictEqual(expirationTimestamp.toNumber(), 0)
        assert.strictEqual(keyPriceCalculator, zeroHex)
        assert.strictEqual(Units.convert(keyPrice.toNumber(), "wei", "eth"), '0.01')
        assert.strictEqual(maxNumberOfKeys.toNumber(), 10)
      })
  })
})
