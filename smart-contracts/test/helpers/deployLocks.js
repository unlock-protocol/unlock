const PublicLock = artifacts.require('./PublicLock.sol')
const Locks = require('../fixtures/locks')

module.exports = function deployLocks (unlock) {
  let locks = {}

  return Promise.all(
    Object.keys(Locks).map(name => {
      return unlock.createLock(
        Locks[name].expirationDuration.toFixed(),
        Locks[name].keyPrice.toFixed(),
        Locks[name].maxNumberOfKeys.toFixed()
      ).then(async (tx) => {
        // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
        const evt = tx.logs[1]
        locks[name] = await PublicLock.at(evt.args.newLockAddress)
        locks[name].params = Locks[name]
      })
    })
  ).then(() => {
    return locks
  })
}
