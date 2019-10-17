const PublicLock = artifacts.require('./PublicLock.sol')
const Web3Utils = require('web3-utils')
const Locks = require('../fixtures/locks')

module.exports = function deployLocks(
  unlock,
  from,
  tokenAddress = Web3Utils.padLeft(0, 40)
) {
  let locks = {}
  return Promise.all(
    Object.keys(Locks).map(name => {
      return unlock
        .createLock(
          Locks[name].expirationDuration.toFixed(),
          tokenAddress,
          Locks[name].keyPrice.toFixed(),
          Locks[name].maxNumberOfKeys.toFixed(),
          Locks[name].lockName,
          { from }
        )
        .then(tx => {
          const evt = tx.logs.find(v => v.event === 'NewLock')
          return PublicLock.at(evt.args.newLockAddress).then(address => {
            locks[name] = address
            locks[name].params = Locks[name]
          })
        })
    })
  ).then(() => {
    return locks
  })
}
