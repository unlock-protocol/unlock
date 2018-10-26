
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
  })

  it('should have created locks with the correct value', () => {
    const lock = locks['FIRST']
    return Promise.all([
      lock.owner.call(),
      lock.expirationDuration.call(),
      lock.keyPrice.call(),
      lock.maxNumberOfKeys.call(),
      lock.outstandingKeys.call()
    ]).then(
      ([
        owner,
        expirationDuration,
        keyPrice,
        maxNumberOfKeys,
        outstandingKeys
      ]) => {
        assert.strictEqual(owner, accounts[0])
        assert.strictEqual(
          expirationDuration.toNumber(),
          60 * 60 * 24 * 30
        )
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
