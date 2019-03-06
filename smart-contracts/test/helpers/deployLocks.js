const PublicLock = artifacts.require('./PublicLock.sol')
const Locks = require('../fixtures/locks')

module.exports = function deployLocks (unlock, from) {
  let locks = {}
  return Promise.all(
    Object.keys(Locks).map(async name => {
      let createCall
      if (unlock.methods && unlock.methods.createLock) {
        createCall = unlock.methods.createLock(
          Locks[name].expirationDuration.toFixed(),
          Locks[name].keyPrice.toFixed(),
          Locks[name].maxNumberOfKeys.toFixed()
        )
      } else {
        createCall = unlock.createLock(
          Locks[name].expirationDuration.toFixed(),
          Locks[name].keyPrice.toFixed(),
          Locks[name].maxNumberOfKeys.toFixed(),
          { from }
        )
      }
      if (createCall.send) {
        const tx = await createCall.send({ from, gasLimit: 4000000 })
        // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
        const evt = tx.events.NewLock
        locks[name] = await PublicLock.at(evt.returnValues.newLockAddress)
        locks[name].params = Locks[name]
      } else {
        const tx = await createCall
        // THIS API IS LIKELY TO BREAK BECAUSE IT ASSUMES SO MUCH
        const evt = tx.logs[1]
        locks[name] = await PublicLock.at(evt.args.newLockAddress)
        locks[name].params = Locks[name]
      }
    })
  ).then(() => {
    return locks
  })
}
