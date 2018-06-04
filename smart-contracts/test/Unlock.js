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
        keyReleaseMechanism,
        expirationDuration,
        expirationTimestamp,
        keyPriceCalculator,
        keyPrice,
        maxNumberOfKeys,
        outstandingKeys
      ]) => {
        assert.strictEqual(owner, accounts[0])
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
})
