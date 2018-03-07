const Lock = artifacts.require('./Lock.sol')
const Locks = require('../fixtures/locks')

module.exports = function deployLocks (unlock) {
  let locks = {}
  return new Promise((resolve, reject) => {
    let createdLocks = 0
    // Note: this is the old syntax for web3 events.
    // At time of writing truffle uses old web3 version 0.20.x
    // This will likely fail with later versions of web3
    let filter = unlock.NewLock((error, { args }) => {
      if (error) {
        filter.stopWatching() // Otherwise, node hangs!
        return reject(error)
      }
      if (!locks[args.lockId]) {
        locks[args.lockId] = Lock.at(args.newLockAddress)
        createdLocks += 1
        if (createdLocks === Locks.length) {
          filter.stopWatching() // Otherwise, node hangs!
          return resolve(locks)
        }
      }
    })

    // // Deploy all the locks!
    return Promise.all(Locks.map(args => {
      return unlock.createLock(args.lockId, args.keyReleaseMechanism, args.expirationDuration, args.expirationTimestamp, args.keyPriceCalculator, args.keyPrice, args.maxNumberOfKeys)
    }))
  })
}
