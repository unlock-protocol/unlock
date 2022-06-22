const { ethers } = require('hardhat')
const PublicLock = artifacts.require('PublicLock')
const createLockHash = require('./createLockCalldata')
const Locks = require('../fixtures/locks')
const { ADDRESS_ZERO, MAX_UINT } = require('./constants')

const unlockContract = artifacts.require('Unlock.sol')
const getContractInstance = require('../helpers/truffle-artifacts')

async function deployLock({
  unlock,
  from: deployer,
  tokenAddress = ADDRESS_ZERO,
  name = 'FIRST',
} = {}) {
  if (!unlock) {
    unlock = await getContractInstance(unlockContract)
  }
  if (!deployer) {
    const [defaultDeployer] = await ethers.getSigners()
    deployer = defaultDeployer.address
  }

  const { expirationDuration, keyPrice, maxNumberOfKeys, lockName } =
    Locks[name]

  const args = [
    name === 'NON_EXPIRING' ? MAX_UINT : expirationDuration.toString(),
    tokenAddress,
    keyPrice.toString(),
    maxNumberOfKeys.toString(),
    lockName,
  ]

  const calldata = await createLockHash({ args, from: deployer })
  const tx = await unlock.createUpgradeableLock(calldata)
  const evt = tx.logs.find((v) => v.event === 'NewLock')
  const lock = await PublicLock.at(evt.args.newLockAddress)
  return lock
}

async function deployAllLocks(unlock, from, tokenAddress = ADDRESS_ZERO) {
  let locks = {}
  await Promise.all(
    Object.keys(Locks).map((name) =>
      deployLock(unlock, from, tokenAddress, Locks[name])
    )
  )
  return locks
}

module.exports = {
  deployLock,
  deployAllLocks,
}
