const PublicLock = artifacts.require('PublicLock')
const createLockHash = require('./createLockCalldata')
const Locks = require('../fixtures/locks')
const { ADDRESS_ZERO } = require('./constants')

module.exports = async function deployLocks(
  unlock,
  from,
  tokenAddress = ADDRESS_ZERO
) {
  let locks = {}
  await Promise.all(
    Object.keys(Locks).map(async (name) => {
      const args = [
        Locks[name].expirationDuration,
        tokenAddress,
        Locks[name].keyPrice,
        Locks[name].maxNumberOfKeys,
        Locks[name].lockName,
      ]
      const calldata = await createLockHash({ args, from })
      const tx = await unlock.createUpgradeableLock(calldata)
      const evt = tx.logs.find((v) => v.event === 'NewLock')
      const lock = await PublicLock.at(evt.args.newLockAddress)
      locks[name] = lock
      locks[name].params = Locks[name]
    })
  )
  return locks
}
