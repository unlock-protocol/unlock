const { ethers } = require('hardhat')
const PublicLock = artifacts.require('PublicLock')
const createLockHash = require('./createLockCalldata')
const Locks = require('../fixtures/locks')
const deployContracts = require('../fixtures/deploy')
const { ADDRESS_ZERO, MAX_UINT } = require('./constants')

async function deployLock({
  unlock,
  from: deployer,
  tokenAddress = ADDRESS_ZERO,
  name = 'FIRST',
} = {}) {
  if (!unlock) {
    ;({ unlock } = await deployContracts())
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

  // support passing unlock as either truffle or ethersjs contract instance
  const tx = await unlock.createUpgradeableLock(calldata)
  let evt
  if (unlock.constructor.name === 'TruffleContract') {
    evt = tx.logs.find((v) => v.event === 'NewLock')
  } else {
    const { events } = await tx.wait()
    evt = events.find((v) => v.event === 'NewLock')
  }
  const { newLockAddress } = evt.args
  const lock = await PublicLock.at(newLockAddress)
  return lock
}

async function deployAllLocks(unlock, from, tokenAddress = ADDRESS_ZERO) {
  const locks = await Promise.all(
    Object.keys(Locks).map((name) =>
      deployLock(unlock, from, tokenAddress, Locks[name])
    )
  )
  return locks.reduce(
    (acc, d, i) => ({
      ...acc,
      [Object.keys(Locks)[i]]: locks[i],
    }),
    {}
  )
}

module.exports = {
  deployLock,
  deployAllLocks,
}
