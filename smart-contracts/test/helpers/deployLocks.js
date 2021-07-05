const PublicLock = artifacts.require('PublicLock')

const Locks = require('../fixtures/locks')

let saltCounter = 100

module.exports = async function deployLocks(
  unlock,
  from,
  tokenAddress = web3.utils.padLeft(0, 40)
) {
  let locks = {}
  await Promise.all(
    Object.keys(Locks).map(async (name) => {
      const tx = await unlock.createLock(
        Locks[name].expirationDuration.toFixed(),
        tokenAddress,
        Locks[name].keyPrice.toFixed(),
        Locks[name].maxNumberOfKeys.toFixed(),
        Locks[name].lockName,
        // This ensures that the salt is unique even if we deploy locks multiple times
        `0x${(saltCounter++).toString(16)}`,
        { from }
      )
      const evt = tx.logs.find((v) => v.event === 'NewLock')
      const lock = await PublicLock.at(evt.args.newLockAddress)
      locks[name] = lock
      locks[name].params = Locks[name]
    })
  )
  return locks
}
