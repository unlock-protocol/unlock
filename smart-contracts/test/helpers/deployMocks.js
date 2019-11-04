// const PublicLock = artifacts.require('./PublicLock.sol')
const TimeMachineMock = artifacts.require('TimeMachineMock')
const Web3Utils = require('web3-utils')
const Locks = require('../fixtures/locks')

let saltCounter = 100

module.exports = function deployMocks(
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
          // This ensures that the salt is unique even if we deploy locks multiple times
          `0x${(saltCounter++).toString(16)}`,
          { from }
        )
        .then(tx => {
          const evt = tx.logs.find(v => v.event === 'NewLock')
          return TimeMachineMock.at(evt.args.newLockAddress).then(address => {
            locks[name] = address
            locks[name].params = Locks[name]
          })
        })
    })
  ).then(() => {
    return locks
  })
}
