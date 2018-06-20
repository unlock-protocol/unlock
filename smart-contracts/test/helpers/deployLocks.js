const Lock = artifacts.require('./Lock.sol')
const Locks = require('../fixtures/locks')

module.exports = function deployLocks (unlock) {
  let locks = {}

  return Promise.all(
    Object.keys(Locks).map(name => {
      return unlock.createLock(
        Locks[name].keyReleaseMechanism,
        Locks[name].expirationDuration,
        Locks[name].keyPrice,
        Locks[name].maxNumberOfKeys
      ).then((tx) => {
        // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
        const evt = tx.logs[0]
        locks[name] = Lock.at(evt.args.newLockAddress)
        locks[name].params = Locks[name]
      })
    })
  ).then(() => {
    return locks
  })
}
