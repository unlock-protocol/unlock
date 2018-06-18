const deployLocks = require('./helpers/deployLocks')
const Unlock = artifacts.require('./Unlock.sol')

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

  it('should have created locks with a link to Unlock', () => {
    const lock = locks['FIRST']
    return lock.unlockProtocol()
      .then((unlockProtocol) => {
        assert.equal(unlockProtocol, unlock.address)
      })
  })

  it('should have kept track of the Lock inside Unlock with the right balances', () => {
    // This is a bit of a dumb test because when the lock is missing, the value are 0 anyway...
    return unlock.locks(locks['FIRST'].address).then(([totalSales, yieldedDiscountTokens]) => {
      assert.equal(totalSales.toNumber(), 0)
      assert.equal(yieldedDiscountTokens.toNumber(), 0)
    })
  })
})
