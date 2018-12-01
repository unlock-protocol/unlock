const PublicLock = artifacts.require('./PublicLock.sol')
const Locks = require('../fixtures/locks')

module.exports = function deployLocks (unlock) {
  let locks = {}

  return Promise.all(
    Object.keys(Locks).map(name => {
      return unlock.createLock(
        Locks[name].expirationDuration,
        Locks[name].keyPrice,
        Locks[name].maxNumberOfKeys
      ).then((tx) => {
        // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
        const evt = tx.logs[2]
        locks[name] = PublicLock.at(evt.args.newLockAddress)
        locks[name].params = Locks[name]
      })
    })
  ).then(() => {
    return locks
  })
}
